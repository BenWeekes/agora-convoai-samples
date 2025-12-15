# Agora Conversational AI - Implementation Guide for AI Assistants

This guide helps AI coding assistants implement Agora Conversational AI voice agents in web applications.

## Architecture Overview

```
                          ┌─────────────────────────┐
                          │  Your Backend Services  │
                          └───────┬───────────┬─────┘
                                 ╱             ╲
                                ╱               ╲
                               ╱                 ╲
                              ╱                   ╲
         1. Serves client app│                     │3. Agent REST API
         2. Provides token,  │                     │   (token, uid, channel,
            uid, channel     │                     │    agent properties)
                            ╱                       ╲
                           ╱                         ╲
                          ↓                           ↓
              ┌────────────────────┐      ┌────────────────────┐
              │  Voice AI Client   │      │  AI Agent Instance │
              └──────────┬─────────┘      └─────────┬──────────┘
                         │                          │
                         │                          │
                         │     ┌──────────────┐     │
                         └────→│ Agora SD-RTN │←────┘
                               │              │
                               │ Audio, Video,│
                               │     Data     │
                               └──────────────┘
```

## Implementation Steps

### 1. Backend Setup (Python/Flask or AWS Lambda)

**Required Environment Variables:**
```bash
APP_ID=your_agora_app_id                    # From Agora Console
APP_CERTIFICATE=                             # Leave blank for testing, add for production
AGENT_AUTH_HEADER=Basic_xxx                  # From Agora Console
LLM_API_KEY=your_openai_key                 # OpenAI or compatible LLM
TTS_VENDOR=rime                              # rime, elevenlabs, openai, cartesia
RIME_API_KEY=your_rime_key                  # If using Rime TTS
DEFAULT_GREETING=Hey there!                 # Agent's first message
DEFAULT_PROMPT=You are a helpful assistant  # System prompt for LLM
```

**Core Backend Function (Python):**
```python
from collections import OrderedDict
import requests

def start_agent(channel, app_id, agent_auth_header, llm_config, tts_config, asr_config):
    """Start an AI agent in the channel"""

    # Build agent payload
    payload = {
        "name": channel,
        "properties": OrderedDict([
            ("channel", channel),
            ("token", app_id),  # Use APP_ID when no certificate
            ("agent_rtc_uid", "100"),
            ("agent_rtm_uid", f"100-{channel}"),
            ("remote_rtc_uids", ["*"]),
            ("enable_string_uid", False),
            ("advanced_features", {
                "enable_bhvs": True,
                "enable_rtm": True,
                "enable_aivad": False
            }),
            ("idle_timeout", 120),
            ("llm", llm_config),
            ("tts", tts_config),
            ("asr", asr_config),
            ("vad", {"silence_duration_ms": 300})
        ])
    }

    # Send to Agora API
    url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/join"
    headers = {"Authorization": agent_auth_header, "Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)

    return response.json()

def generate_token(channel, uid, app_id, app_certificate):
    """Generate RTC token - use v007 with RTC+RTM services"""
    if not app_certificate:
        return ""  # Return empty string for testing without certificate
    # Implement v007 token generation (see simple-backend/core/tokens.py)
    return build_token_with_rtm(channel, uid, app_id, app_certificate)
```

**Flask Endpoint:**
```python
@app.route('/start-agent', methods=['GET'])
def start_agent_endpoint():
    channel = request.args.get('channel', f'ch_{int(time.time())}')

    # Generate token for user
    user_token = generate_token(channel, "101", APP_ID, APP_CERTIFICATE)

    # Start agent
    agent_response = start_agent(
        channel=channel,
        app_id=APP_ID,
        agent_auth_header=AGENT_AUTH_HEADER,
        llm_config={...},
        tts_config={...},
        asr_config={...}
    )

    return jsonify({
        "appid": APP_ID,
        "token": user_token,
        "uid": "101",
        "channel": channel,
        "agent_response": agent_response
    })
```

### 2. Client Setup (HTML/JavaScript)

**Install Agora SDK:**
```html
<script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script>
```

**Client Implementation:**
```javascript
let agoraClient = null
let localAudioTrack = null

async function joinChannel(appId, channel, token, uid) {
    // Clean up existing client if any
    if (agoraClient) {
        await agoraClient.leave()
        agoraClient = null
    }

    // Create Agora client
    agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp9' })

    // Listen for remote user (AI agent)
    agoraClient.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
            await agoraClient.subscribe(user, mediaType)
            user.audioTrack.play()  // Play agent's voice
            console.log('Agent is speaking')
        }
    })

    // Join channel (convert token/uid appropriately)
    const rtcToken = token || null  // null if no certificate
    const rtcUid = parseInt(uid)    // Must be integer
    await agoraClient.join(appId, channel, rtcToken, rtcUid)

    // Create and publish microphone
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'high_quality_stereo',
        AEC: true,  // Echo cancellation
        ANS: true,  // Noise suppression
        AGC: true   // Auto gain control
    })

    await agoraClient.publish(localAudioTrack)
    console.log('Connected to agent')
}

async function startConversation() {
    // Call backend to start agent
    const response = await fetch(`/start-agent?channel=mychannel`)
    const data = await response.json()

    // Join channel with returned credentials
    await joinChannel(data.appid, data.channel, data.token, data.uid)
}

async function leaveChannel() {
    if (localAudioTrack) {
        localAudioTrack.close()
        localAudioTrack = null
    }
    if (agoraClient) {
        await agoraClient.leave()
        agoraClient = null
    }
}
```

### 3. TTS Vendor Configuration

**Rime (Recommended):**
```python
tts_config = {
    "vendor": "rime",
    "params": {
        "api_key": RIME_API_KEY,
        "speaker": "astra",
        "modelId": "mistv2",
        "lang": "eng",
        "samplingRate": 16000,
        "speedAlpha": 1.0
    }
}
```

**ElevenLabs:**
```python
tts_config = {
    "vendor": "elevenlabs",
    "params": {
        "api_key": ELEVENLABS_API_KEY,
        "voice_id": "21m00Tcm4TlvDq8ikWAM",
        "model_id": "eleven_flash_v2_5",
        "stability": 0.5,
        "similarity_boost": 0.8
    }
}
```

### 4. ASR (Speech Recognition) Configuration

**Ares (Default - No API key needed):**
```python
asr_config = {
    "vendor": "ares",
    "language": "en-US"
}
```

**Deepgram:**
```python
asr_config = {
    "vendor": "deepgram",
    "params": {
        "api_key": DEEPGRAM_API_KEY,
        "model": "nova-3",
        "language": "en"
    }
}
```

### 5. LLM Configuration

```python
llm_config = {
    "url": "https://api.openai.com/v1/chat/completions",
    "api_key": LLM_API_KEY,
    "system_messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant. Keep responses under 30 words."
        }
    ],
    "greeting_message": "Hi! How can I help you today?",
    "failure_message": "Sorry, something went wrong",
    "max_history": 32,
    "params": {
        "model": "gpt-4o"
    }
}
```

## Sample Code Reference

**Simple Voice Client** (`simple-voice-client/`)
- Standalone HTML client for testing
- Manual credential entry (appid, token, uid)
- Real-time audio visualization
- Use when: Testing agents without backend

**Simple Backend** (`simple-backend/`)
- Python Flask + AWS Lambda compatible
- Modular architecture (core/ folder shared)
- Token generation (v007 with RTC+RTM)
- Agent lifecycle management
- Use when: Need production backend

**Complete Voice Client** (`complete-voice-client/`)
- Full integration: client calls backend
- Auto-starts agent on join
- Production-ready flow
- Use when: Building complete app

## Quick Start Commands

**Backend:**
```bash
cd simple-backend
pip3 install -r requirements-local.txt
# Create .env file with credentials
PORT=8082 python3 local_server.py
```

**Client:**
```bash
cd complete-voice-client
python3 -m http.server 8003
# Open http://localhost:8003
```

## Common Patterns

**Backend with CORS (for local development):**
```python
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
```

**Profile-based Configuration:**
```python
# Environment variables
DEFAULT_PROMPT_sales=You are a sales assistant
DEFAULT_PROMPT_support=You are a support agent

# Usage
profile = request.args.get('profile', 'default')
prompt = get_env_var('DEFAULT_PROMPT', profile)
```

**Agent Cleanup:**
```python
def hangup_agent(agent_id, app_id, agent_auth_header):
    url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/agents/{agent_id}"
    headers = {"Authorization": agent_auth_header}
    response = requests.delete(url, headers=headers)
    return response.json()
```

## Key Requirements

1. **UID Handling**: Backend sends UIDs as strings, client converts to integers with `parseInt()`
2. **Token Handling**: Empty string from backend → `null` in client join call
3. **enable_string_uid**: Must be `false` for integer UIDs
4. **Codec**: Use `vp9` for best compatibility
5. **Audio Config**: Enable AEC, ANS, AGC for clear audio

## Troubleshooting

**"UID_CONFLICT" error**: Multiple clients using same UID - ensure cleanup before rejoin
**"no such stream id" error**: Agent UID mismatch - verify agent joined with correct UID
**"INVALID_PARAMS" token error**: Pass `null` not empty string when no certificate
**Agent not speaking**: Check TTS vendor API key and configuration
**Can't hear user**: Verify microphone permissions and AGC/AEC settings

## Next Steps

1. Copy relevant code from samples to your project
2. Set up environment variables
3. Implement backend endpoint(s)
4. Add client SDK and connection logic
5. Test with a simple channel first
6. Add error handling and UI polish
7. Enable APP_CERTIFICATE for production
