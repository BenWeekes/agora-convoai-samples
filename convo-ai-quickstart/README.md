# Agora Conversational AI - Implementation Guide for AI Assistants

This guide helps AI coding assistants implement Agora Conversational AI voice
agents in web applications.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [RTC and RTM Explained](#rtc-and-rtm-explained)
- [Implementation Approaches](#implementation-approaches)
  - [Approach A: Use SDK Packages](#approach-a-use-sdk-packages-recommended)
  - [Approach B: Use Sample as Template](#approach-b-use-sample-as-template)
  - [Approach C: Bare RTC/RTM Implementation](#approach-c-bare-rtcrtm-implementation)
- [SDK Package Reference](#sdk-package-reference)
  - [ConversationalAIAPI](#conversationalapiapi)
  - [RTCHelper](#rtchelper)
  - [RTMHelper](#rtmhelper)
  - [React Hooks](#react-hooks)
- [UI Kit Components](#ui-kit-components)
  - [Voice Components](#voice-components)
  - [Chat Components](#chat-components)
  - [Video Components](#video-components)
- [Backend Setup](#backend-setup)
- [Configuration](#configuration)
  - [TTS Vendors](#tts-vendors)
  - [ASR Providers](#asr-providers)
  - [LLM Configuration](#llm-configuration)
- [Sample Code Reference](#sample-code-reference)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Quick Start

Three paths to build a conversational AI app:

**Path A: Use SDK + UI Kit Packages (Recommended)**

```bash
cd agora-convoai-samples
pnpm install
# Import packages: @agora/conversational-ai, @agora/conversational-ai-react, @agora/ui-kit
```

**Path B: Use Sample as Template**

```bash
cd agora-convoai-samples/react-voice-client
pnpm install
pnpm dev
# Open http://localhost:8083
```

**Path C: Implement from Scratch** See
[Bare RTC/RTM Implementation](#approach-c-bare-rtcrtm-implementation) below.

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

## RTC and RTM Explained

Agora Conversational AI uses two complementary SDKs:

**RTC (Real-Time Communication)**

- Handles audio and video streaming between client and agent
- Provides low-latency audio transport
- Manages echo cancellation, noise suppression, auto gain control
- Used for: Voice input/output, audio visualizations

**RTM (Real-Time Messaging)**

- Handles text messages and control signals
- Transmits transcriptions, turn status, interrupts
- Provides structured JSON messages from agent
- Used for: Live transcriptions, chat display, agent state

Both use the same channel and require proper token generation. The SDK packages
abstract the complexity of managing both connections.

## Implementation Approaches

### Approach A: Use SDK Packages (Recommended)

Install workspace packages from this repository:

```json
{
  "dependencies": {
    "@agora/conversational-ai": "workspace:*",
    "@agora/conversational-ai-react": "workspace:*",
    "@agora/ui-kit": "workspace:*"
  }
}
```

Use React hooks for quick integration:

```typescript
import { useConversationalAI } from '@agora/conversational-ai-react'
import { MicButton, AgentVisualizer, ConvoTextStream } from '@agora/ui-kit'

function VoiceClient() {
  const {
    isConnected,
    isMuted,
    messageList,
    currentInProgressMessage,
    isAgentSpeaking,
    joinChannel,
    leaveChannel,
    toggleMute,
  } = useConversationalAI({
    appId: 'your_app_id',
    channel: 'your_channel',
    token: 'your_token',
    uid: '101',
    agentUID: '100',
  })

  return (
    <div>
      <AgentVisualizer state={isAgentSpeaking ? 'talking' : 'listening'} />
      <MicButton state={isMuted ? 'idle' : 'listening'} onClick={toggleMute} />
      <ConvoTextStream
        messageList={messageList}
        currentInProgressMessage={currentInProgressMessage}
        agentUID="100"
      />
    </div>
  )
}
```

### Approach B: Use Sample as Template

Copy react-voice-client sample application:

```bash
cp -r react-voice-client my-voice-app
cd my-voice-app
pnpm install
# Update configuration
pnpm dev
```

Modify `components/VoiceClient.tsx` and `hooks/useAgoraVoiceClient.ts` as
needed.

### Approach C: Bare RTC/RTM Implementation

Install Agora SDKs directly:

```bash
npm install agora-rtc-sdk-ng agora-rtm
```

Implement RTC audio connection:

```javascript
import AgoraRTC from "agora-rtc-sdk-ng"

let agoraClient = null
let localAudioTrack = null

async function joinChannel(appId, channel, token, uid) {
  agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" })

  agoraClient.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await agoraClient.subscribe(user, mediaType)
      user.audioTrack.play()
    }
  })

  await agoraClient.join(appId, channel, token || null, parseInt(uid))

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "high_quality_stereo",
    AEC: true,
    ANS: true,
    AGC: true,
  })

  await agoraClient.publish(localAudioTrack)
}
```

Implement RTM message handling:

```javascript
import AgoraRTM from "agora-rtm"

const rtmClient = AgoraRTM.createInstance(appId)

rtmClient.on("MessageFromPeer", (message, peerId) => {
  const data = JSON.parse(message.text)

  if (data.object === "assistant.transcription") {
    console.log("Agent said:", data.text)
  }

  if (data.object === "user.transcription") {
    console.log("User said:", data.text)
  }
})

await rtmClient.login({ token, uid })
```

## SDK Package Reference

### ConversationalAIAPI

Main SDK class for managing conversational AI connections.

```typescript
import { ConversationalAIAPI } from "@agora/conversational-ai"

const api = ConversationalAIAPI.getInstance()

await api.init({
  rtcEngine: rtcClient,
  rtmConfig: {
    appId: "your_app_id",
    token: "your_token",
    uid: "101",
  },
  agentUID: "100",
  renderMode: "auto",
  callback: (messages) => {
    console.log("Messages updated:", messages)
  },
})

await api.start()
await api.dispose()
```

### RTCHelper

Manages Agora RTC client lifecycle and audio tracks.

```typescript
import { RTCHelper } from "@agora/conversational-ai"

const rtcHelper = RTCHelper.getInstance()

await rtcHelper.init({
  appId: "your_app_id",
  channel: "your_channel",
  token: "your_token",
  uid: "101",
})

await rtcHelper.start()
await rtcHelper.dispose()
```

### RTMHelper

Manages Agora RTM client lifecycle and message handling.

```typescript
import { RTMHelper } from "@agora/conversational-ai"

const rtmHelper = RTMHelper.getInstance()

await rtmHelper.init({
  appId: "your_app_id",
  token: "your_token",
  uid: "101",
  onMessageReceived: (message) => {
    console.log("RTM message:", message)
  },
})

await rtmHelper.start()
await rtmHelper.dispose()
```

### React Hooks

**useConversationalAI**

React hook that manages complete conversational AI session.

```typescript
import { useConversationalAI } from '@agora/conversational-ai-react'

const {
  isConnected,
  isMuted,
  micState,
  messageList,
  currentInProgressMessage,
  isAgentSpeaking,
  joinChannel,
  leaveChannel,
  toggleMute,
} = useConversationalAI({
  appId: string
  channel: string
  token: string
  uid: string
  agentUID: string
  renderMode?: 'auto' | 'text' | 'word'
})
```

## UI Kit Components

### Voice Components

**AgentVisualizer**

```typescript
import { AgentVisualizer } from '@agora/ui-kit'

<AgentVisualizer
  state="listening" | "talking" | "analyzing" | "ambient"
  size="sm" | "md" | "lg"
/>
```

**MicButton**

```typescript
import { MicButton } from '@agora/ui-kit'

<MicButton
  state="idle" | "listening" | "processing" | "error"
  onClick={() => toggleMute()}
/>
```

**AudioVisualizer**

```typescript
import { AudioVisualizer } from '@agora/ui-kit'

<AudioVisualizer
  audioLevel={number}
  isActive={boolean}
/>
```

**MicSelector**

```typescript
import { MicSelector } from '@agora/ui-kit'

<MicSelector
  selectedDeviceId={string}
  onDeviceChange={(deviceId) => console.log(deviceId)}
/>
```

### Chat Components

**Conversation**

```typescript
import { Conversation, ConversationContent } from '@agora/ui-kit'

<Conversation height="h-[400px]">
  <ConversationContent>
    {children}
  </ConversationContent>
</Conversation>
```

**Message**

```typescript
import { Message, MessageContent } from '@agora/ui-kit'

<Message role="user" | "assistant">
  <MessageContent>
    {content}
  </MessageContent>
</Message>
```

**ConvoTextStream**

```typescript
import { ConvoTextStream } from '@agora/ui-kit'

<ConvoTextStream
  messageList={IMessageListItem[]}
  currentInProgressMessage={IMessageListItem | null}
  agentUID={string}
  messageSource="rtc" | "rtm"
/>
```

### Video Components

**Avatar**

```typescript
import { Avatar } from '@agora/ui-kit'

<Avatar
  src={string}
  alt={string}
  size="sm" | "md" | "lg"
/>
```

## Backend Setup

Required environment variables:

```bash
APP_ID=your_agora_app_id
APP_CERTIFICATE=your_app_certificate
AGENT_AUTH_HEADER=Basic_xxx
LLM_API_KEY=your_openai_key
TTS_VENDOR=rime
RIME_API_KEY=your_rime_key
DEFAULT_GREETING=Hey there!
DEFAULT_PROMPT=You are a helpful assistant
```

Core backend function:

```python
from collections import OrderedDict
import requests

def start_agent(channel, app_id, agent_auth_header, llm_config, tts_config, asr_config):
    payload = {
        "name": channel,
        "properties": OrderedDict([
            ("channel", channel),
            ("token", app_id),
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

    url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/join"
    headers = {"Authorization": agent_auth_header, "Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)

    return response.json()
```

Token generation (v007 with RTC+RTM):

```python
from agora_token_builder import AccessToken, ServiceRtc, ServiceRtm

def build_token_with_rtm(channel, uid, app_id, app_certificate):
    if not app_certificate:
        return ""

    token = AccessToken(app_id, app_certificate)

    # RTC Service
    rtc_service = ServiceRtc(channel, uid)
    rtc_service.add_privilege(ServiceRtc.kPrivilegeJoinChannel, 3600)
    rtc_service.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, 3600)
    token.add_service(rtc_service)

    # RTM Service
    rtm_service = ServiceRtm(uid)
    rtm_service.add_privilege(ServiceRtm.kPrivilegeLogin, 3600)
    token.add_service(rtm_service)

    return token.build()
```

Flask endpoint:

```python
@app.route('/start-agent', methods=['GET'])
def start_agent_endpoint():
    channel = request.args.get('channel', f'ch_{int(time.time())}')
    user_token = build_token_with_rtm(channel, "101", APP_ID, APP_CERTIFICATE)

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

## Configuration

### TTS Vendors

**Rime (Recommended)**

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

**ElevenLabs**

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

**OpenAI**

```python
tts_config = {
    "vendor": "openai",
    "params": {
        "api_key": OPENAI_API_KEY,
        "voice": "alloy",
        "model": "tts-1"
    }
}
```

**Cartesia**

```python
tts_config = {
    "vendor": "cartesia",
    "params": {
        "api_key": CARTESIA_API_KEY,
        "voice_id": "a0e99841-438c-4a64-b679-ae501e7d6091",
        "model_id": "sonic-english"
    }
}
```

### ASR Providers

**Ares (Default - No API key needed)**

```python
asr_config = {
    "vendor": "ares",
    "language": "en-US"
}
```

**Deepgram**

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

### LLM Configuration

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

**react-voice-client**

- React/Next.js application using SDK and UI Kit packages
- Full integration with backend
- Production-ready component structure
- Location: `/react-voice-client/`

**simple-voice-client**

- Standalone HTML client for testing
- Manual credential entry (appid, token, uid)
- Real-time audio visualization
- Location: `/simple-voice-client/`

**simple-backend**

- Python Flask + AWS Lambda compatible
- Token generation with RTC+RTM
- Agent lifecycle management
- Location: `/simple-backend/`

**client-sdk**

- Core SDK packages (ConversationalAIAPI, RTCHelper, RTMHelper)
- React hooks (useConversationalAI)
- Location: `/client-sdk/`

**client-ui-kit**

- Pre-built UI components
- Voice, chat, video components
- Location: `/client-ui-kit/`

## Common Patterns

**Start backend and frontend (pnpm workspace):**

```bash
cd agora-convoai-samples

# Terminal 1: Backend
cd simple-backend
PORT=8082 python3 local_server.py

# Terminal 2: Frontend
pnpm dev
# Open http://localhost:8083
```

**Backend with CORS (local development):**

```python
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
```

**Profile-based configuration:**

```python
# Environment variables
DEFAULT_PROMPT_sales=You are a sales assistant
DEFAULT_PROMPT_support=You are a support agent

# Usage
profile = request.args.get('profile', 'default')
prompt = get_env_var('DEFAULT_PROMPT', profile)
```

**Agent cleanup:**

```python
def hangup_agent(agent_id, app_id, agent_auth_header):
    url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/agents/{agent_id}"
    headers = {"Authorization": agent_auth_header}
    response = requests.delete(url, headers=headers)
    return response.json()
```

## Troubleshooting

**"UID_CONFLICT" error**

- Multiple clients using same UID
- Ensure cleanup before rejoin

**"no such stream id" error**

- Agent UID mismatch
- Verify agent joined with correct UID

**"INVALID_PARAMS" token error**

- Pass `null` not empty string when no certificate
- Use `parseInt(uid)` for RTC client

**Agent not speaking**

- Check TTS vendor API key
- Verify TTS configuration

**Can't hear user**

- Verify microphone permissions
- Check AGC/AEC settings

**Module not found errors**

- Run `pnpm install` from repository root
- Verify workspace packages are linked correctly
