# Agora Conversational AI - Quick Start Guide

Implementation guide for adding Agora voice and video AI agents to web
applications.

## Quick Start Decision Tree

**Choose your path:**

```
Need video/avatar?
├─ Yes → Use react-video-client-avatar sample + SDK packages
└─ No (voice only)
   ├─ Using React?
   │  ├─ Yes → Use react-voice-client sample + UI Kit
   │  └─ No → Use simple-voice-client or bare RTC/RTM
   └─ Starting from scratch?
      ├─ Yes → Use SDK packages (@agora/conversational-ai)
      └─ No (existing app) → Add RTC/RTM directly
```

**Quick links:**

- **SDK API Reference:** [client-sdk/README.md](../client-sdk/README.md)
- **UI Kit Components:** [client-ui-kit/README.md](../client-ui-kit/README.md)
- **Backend Setup:** [simple-backend/README.md](../simple-backend/README.md)

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

**Flow:**

1. Backend serves client app and generates credentials (token, uid, channel)
2. Backend calls Agora Agent REST API to start AI agent
3. Both client and agent join same Agora channel
4. Real-time audio/video/data flows through SD-RTN

## RTC and RTM Explained

**RTC (Real-Time Communication)**

- Audio and video streaming between client and agent
- Low-latency audio transport with echo cancellation, noise suppression
- Used for: Voice input/output, video streams, audio visualizations

**RTM (Real-Time Messaging)**

- Text messages and control signals
- Live transcriptions, turn status, interrupts
- Used for: Chat display, agent state, structured JSON messages

Both use the same channel and require proper token generation.

## Implementation Approaches

### Approach A: SDK Packages (Recommended)

Best for: New projects, React apps, TypeScript

```bash
cd agora-convoai-samples
pnpm install
```

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

### Approach B: Sample as Template

Best for: Quick prototyping, learning by example

**Voice only:**

```bash
cp -r react-voice-client my-voice-app
cd my-voice-app
pnpm install
pnpm dev
```

**Video + Avatar:**

```bash
cp -r react-video-client-avatar my-video-app
cd my-video-app
pnpm install
pnpm dev
```

### Approach C: Bare RTC/RTM Implementation

Best for: Non-React apps, custom integrations

```bash
npm install agora-rtc-sdk-ng agora-rtm
```

**RTC Setup:**

```javascript
import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" })

client.on("user-published", async (user, mediaType) => {
  if (mediaType === "audio") {
    await client.subscribe(user, mediaType)
    user.audioTrack.play()
  }
})

await client.join(appId, channel, token || null, parseInt(uid))

const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
  encoderConfig: "high_quality_stereo",
  AEC: true,
  ANS: true,
  AGC: true,
})

await client.publish(localAudioTrack)
```

**RTM Setup:**

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

## SDK Packages Reference

**Full API Documentation:** [client-sdk/README.md](../client-sdk/README.md)

### Core SDK (@agora/conversational-ai)

**ConversationalAIAPI** - Main class managing RTC+RTM session

```typescript
const api = ConversationalAIAPI.getInstance()
await api.init({ rtcEngine, rtmConfig, agentUID, callback })
await api.start()
```

**RTCHelper** - RTC client lifecycle

```typescript
const rtc = RTCHelper.getInstance()
await rtc.init({ appId, channel, token, uid })
await rtc.start()
```

**RTMHelper** - RTM message handling

```typescript
const rtm = RTMHelper.getInstance()
await rtm.init({ appId, token, uid, onMessageReceived })
await rtm.start()
```

### React Hooks (@agora/conversational-ai-react)

**useConversationalAI** - Complete session management

```typescript
const {
  isConnected,
  isMuted,
  messageList,
  isAgentSpeaking,
  joinChannel,
  leaveChannel,
  toggleMute,
} = useConversationalAI({ appId, channel, token, uid, agentUID })
```

**useLocalVideo** - Local camera tracks

```typescript
const { videoTrack, isVideoEnabled, toggleVideo } = useLocalVideo({ client })
```

**useRemoteVideo** - Remote video streams

```typescript
const { remoteVideoUsersArray } = useRemoteVideo({ client })
```

## UI Kit Components Reference

**Full Component Documentation:**
[client-ui-kit/README.md](../client-ui-kit/README.md)

### Voice Components

| Component         | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `MicButton`       | Microphone control with states (idle, listening, processing, error) |
| `AgentVisualizer` | Animated agent visual (listening, talking, analyzing, ambient)      |
| `AudioVisualizer` | Real-time audio level visualization                                 |
| `MicSelector`     | Microphone device selection dropdown                                |

### Chat Components

| Component         | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `Conversation`    | Chat container with scroll management           |
| `Message`         | Message bubble (user/assistant roles)           |
| `ConvoTextStream` | Auto-updating transcript display with streaming |

### Video Components

| Component            | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `LocalVideoPreview`  | Local camera preview with mirror effect    |
| `AvatarVideoDisplay` | Remote avatar video with connection states |
| `Avatar`             | Profile avatar image                       |

### Layout Components

| Component    | Purpose                           |
| ------------ | --------------------------------- |
| `VideoGrid`  | Desktop 2x2 grid layout for video |
| `MobileTabs` | Mobile tab switcher (Video/Chat)  |

## Sample Applications

| Sample                        | Description                            | Location                                                    |
| ----------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| **react-voice-client**        | React/Next.js voice client with UI Kit | [react-voice-client/](../react-voice-client/)               |
| **react-video-client-avatar** | Video + avatar with responsive layouts | [react-video-client-avatar/](../react-video-client-avatar/) |
| **simple-voice-client**       | Standalone HTML client for testing     | [simple-voice-client/](../simple-voice-client/)             |
| **simple-backend**            | Python Flask backend + Lambda          | [simple-backend/](../simple-backend/)                       |
| **client-sdk**                | Core SDK packages                      | [client-sdk/](../client-sdk/)                               |
| **client-ui-kit**             | React component library                | [client-ui-kit/](../client-ui-kit/)                         |

## Backend Quick Reference

**Full Backend Documentation:**
[simple-backend/README.md](../simple-backend/README.md)

**Environment Setup:** See
[simple-backend/.env.example](../simple-backend/.env.example)

**Core Endpoint:**

```python
@app.route('/start-agent', methods=['GET'])
def start_agent():
    channel = request.args.get('channel', f'ch_{int(time.time())}')

    # Generate token with RTC+RTM
    user_token = build_token_with_rtm(channel, "101", APP_ID, APP_CERTIFICATE)

    # Start agent via REST API
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

**Token Generation (v007 with RTC+RTM):**

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

**Agent Configuration:**

```python
# Agent REST API endpoint
url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{app_id}/join"

payload = {
    "name": channel,
    "properties": {
        "channel": channel,
        "token": token,
        "agent_rtc_uid": "100",
        "agent_rtm_uid": f"100-{channel}",
        "remote_rtc_uids": ["*"],  # Use specific UID for avatar mode
        "enable_string_uid": False,
        "advanced_features": {
            "enable_bhvs": True,
            "enable_rtm": True,
            "enable_aivad": False
        },
        "idle_timeout": 120,
        "llm": {...},
        "tts": {...},
        "asr": {...}
    }
}
```

## Common Issues

**"UID_CONFLICT" error**

- Multiple clients using same UID
- Ensure cleanup before rejoin: `await client.leave()`

**"no such stream id" error**

- Agent UID mismatch between backend config and client subscription
- Verify `agentUID` matches `agent_rtc_uid` in backend

**Token errors**

- Pass `null` not empty string when no certificate: `token || null`
- Use `parseInt(uid)` for RTC client join

**Agent not speaking**

- Check TTS vendor API key in backend `.env`
- Verify backend logs for agent creation errors

**Can't hear user**

- Check microphone permissions in browser
- Verify audio track creation with AEC/ANS/AGC enabled

**Video not showing (avatar mode)**

- Ensure backend uses specific UID for `remote_rtc_uids`, not wildcard `"*"`
- Check `useMediaStream={true}` prop for multi-instance video rendering
- Verify avatar endpoint configured correctly (Anam BETA)

**Module not found**

- Run `pnpm install` from repository root
- Check workspace packages linked: `@agora/conversational-ai`, `@agora/ui-kit`
