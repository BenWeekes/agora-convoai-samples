# React Voice AI Client

React/Next.js implementation demonstrating the Agora Conversational AI SDK and UI Kit integration.

## Features

- ✅ **Copy-based Architecture** - SDK and UI Kit code copied from `../client-sdk` and `../client-ui-kit`
- ✅ **Real-time Transcription** - Live transcription rendering with word-level and text-level modes
- ✅ **UI Components** - Pre-built components for chat, audio visualization, and agent state
- ✅ **MicButton** - Microphone control with visual feedback
- ✅ **RTC Audio** - High-quality stereo audio with echo cancellation, noise suppression, and auto gain control
- ✅ **TypeScript** - Full type safety with Agora SDK and UIKit types
- ✅ **React 19 & Next.js 16** - Latest React features and patterns

## Architecture

This sample application contains copies of the SDK and UI Kit code, making it easy to run as a standalone example:

**Code Structure:**
- `/conversational-ai-api` - Core SDK (copied from `../client-sdk/conversational-ai-api`)
- `/react` - React hooks (copied from `../client-sdk/react`)
- `/components/agora-ui` - UI components (copied from `../client-ui-kit/components`)

**Key Components:**
1. **ConversationalAIAPI** - Main SDK for managing voice AI connections
2. **RTCHelper** - Handles Agora RTC audio connections
3. **SubRenderController** - Manages real-time transcription rendering
4. **UI Components** - Pre-built components for chat, audio visualization, buttons, and agent state

For a detailed comparison with other implementations, see [COMPARISON.md](./COMPARISON.md).

## Prerequisites

- Node.js 18+
- Python backend running on port 8082 (see `../simple-backend/`)
- Agora account with App ID

## Port Allocation

The agora-convoai-samples repository uses the following port sequence:

- **8082** - Python Backend (simple-backend)
- **8083** - React Voice Client (this project)
- Port 3000 is intentionally avoided as it's commonly used by other development servers

## Quick Start

**Initial Setup (First Time):**

This project contains copies of code from `../client-sdk` and `../client-ui-kit`. To get the latest versions:

```bash
# Copy SDK code
cp -r ../client-sdk/conversational-ai-api ./
cp -r ../client-sdk/react ./

# Copy UI Kit components
mkdir -p components/agora-ui
cp ../client-ui-kit/components/* components/agora-ui/
```

**Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**Run development server:**
```bash
npm run dev
```

**Open browser:**
```
http://localhost:8083
```

## Backend Setup

This client requires a running backend. Start the backend first:

```bash
cd ../simple-backend
PORT=8082 python3 local_server.py
```

## Usage

1. **Start the Backend** (if not already running):
   ```bash
   cd ../simple-backend
   PORT=8082 python3 local_server.py
   ```

2. **Start the React Client**:
   ```bash
   npm run dev
   ```

3. **Connect to Agent**:
   - Enter a channel name (e.g., "test-channel")
   - Backend URL should be `http://localhost:8082` (default)
   - Agent UID should be "0" (default - must match agent's UID)
   - Click "Start Conversation"

4. **Interact with Agent**:
   - Speak into your microphone
   - See real-time transcriptions in the fixed-position chat window (bottom-right)
   - Toggle mute with the microphone button
   - End the call with the "End Call" button

## Project Structure

```
react-voice-client/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main page with dynamic import
│   └── globals.css              # Tailwind CSS
├── components/
│   ├── VoiceClient.tsx          # Main voice client component
│   └── agora-ui/                # UI components (copied from ../client-ui-kit)
│       ├── mic-button.tsx
│       ├── agent-visualizer.tsx
│       ├── conversation.tsx
│       ├── message.tsx
│       └── ...
├── conversational-ai-api/       # SDK code (copied from ../client-sdk)
│   ├── helper/
│   │   ├── rtc.ts
│   │   └── rtm.ts
│   ├── utils/
│   │   └── sub-render.ts
│   ├── type.ts
│   └── index.ts
├── react/                       # React hooks (copied from ../client-sdk)
│   └── use-conversational-ai.ts
├── hooks/
│   ├── use-audio-devices.ts
│   ├── use-is-mobile.ts
│   └── useAgoraVoiceClient.ts   # Custom hook for Agora integration
├── lib/
│   ├── utils.ts                 # Utility functions (cn, markdown renderer)
│   └── theme/                   # Theme utilities
├── icons/
│   └── PhoneReceiver.tsx        # Custom icons
├── COMPARISON.md                # Comparison with other implementations
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Key Implementation Details

### MessageEngine Integration

The MessageEngine handles real-time transcription messages from the Agora RTC stream:

```typescript
import { MessageEngine, EMessageEngineMode, IMessageListItem } from "@/lib/message-engine"

const engine = new MessageEngine({
  rtcEngine: client,  // Agora RTC client
  renderMode: EMessageEngineMode.AUTO,  // AUTO, TEXT, or WORD
  callback: (messages) => {
    // Filter completed messages vs in-progress
    const completedMessages = messages.filter(msg => msg.status !== 0)
    const inProgress = messages.find(msg => msg.status === 0)

    setMessageList(completedMessages)
    setCurrentInProgressMessage(inProgress || null)
  },
})
```

**Rendering Modes:**
- `AUTO` - Automatically determines best mode based on message content
- `TEXT` - Processes messages as complete text blocks
- `WORD` - Word-by-word rendering with timing information

### ConvoTextStream Component

Displays transcriptions in a fixed-position chat window (bottom-right):

```typescript
<ConvoTextStream
  messageList={messageList}
  currentInProgressMessage={currentInProgressMessage}
  agentUID="0"
  messageSource="rtc"
/>
```

**Features:**
- Auto-opens on first message
- Auto-scroll with manual override detection
- Supports streaming (in-progress) messages with pulse animation
- Markdown rendering
- Collapsible/expandable with message count indicator
- Avatar display (AI vs User)

### Agent Visualizer

Shows Lottie animations for different agent states:

```typescript
<AgentVisualizer
  state={isAgentSpeaking ? "talking" : "listening"}
  size="lg"
/>
```

**Available States:**
- `not-joined` - Not connected
- `joining` - Connecting to channel
- `ambient` - Connected but idle
- `listening` - Listening to user
- `analyzing` - Processing user input
- `talking` - Agent is speaking
- `disconnected` - Disconnected from channel

### Microphone Button

Controls microphone with live waveform visualization:

```typescript
<MicButton
  state={micState}  // "idle" | "listening" | "processing" | "error"
  onClick={toggleMute}
/>
```

**States:**
- `idle` - Not active
- `listening` - Active and listening (shows waveform)
- `processing` - Processing audio
- `error` - Microphone error

### Custom Hook: useAgoraVoiceClient

Encapsulates all Agora RTC logic:

```typescript
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
} = useAgoraVoiceClient()
```

**Responsibilities:**
- Agora client lifecycle management
- MessageEngine initialization and cleanup
- Microphone track creation with AEC/ANS/AGC
- Remote user (agent) audio subscription and playback
- Agent speaking state detection
- Mute/unmute functionality

## Message Types

The MessageEngine processes these message types from RTC stream-message events:

### User Transcription
```typescript
{
  object: "user.transcription",
  text: "Hello, how are you?",
  final: true,
  turn_id: 123,
  stream_id: 1234,
  user_id: "1234",
  language: "en-US",
  start_ms: 0,
  duration_ms: 1500,
  words: [
    { word: "Hello", start_ms: 0, duration_ms: 200, stable: true },
    { word: "how", start_ms: 200, duration_ms: 150, stable: true },
    ...
  ]
}
```

### Agent Transcription
```typescript
{
  object: "assistant.transcription",
  text: "I'm doing well, thank you!",
  quiet: false,
  turn_seq_id: 1,
  turn_status: 1,  // 0=IN_PROGRESS, 1=END, 2=INTERRUPTED
  turn_id: 124,
  stream_id: 0,
  user_id: "0",
  language: "en-US",
  start_ms: 0,
  duration_ms: 2000,
  words: [...]
}
```

### Message Interrupt
```typescript
{
  object: "message.interrupt",
  message_id: "msg_123",
  data_type: "message",
  turn_id: 124,
  start_ms: 1500,
  send_ts: 1234567890
}
```

## Building for Production

```bash
npm run build
npm start
```

The build creates an optimized production bundle with:
- Server-side rendering disabled for browser-only components (Agora SDK)
- TypeScript type checking
- Optimized static pages

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Agora AI UIKit (package branch)
- **RTC SDK**: agora-rtc-sdk-ng v4.24+
- **Icons**: lucide-react
- **Animations**: @lottiefiles/dotlottie-react

## Comparison with Other Clients

| Feature | Simple Voice Client | Complete Voice Client | React Voice Client |
|---------|-------------------|---------------------|-------------------|
| Framework | Vanilla HTML/JS | Vanilla HTML/JS | React 19/Next.js 16 |
| Backend Integration | ❌ Manual | ✅ Automatic | ✅ Automatic |
| Transcripts | ❌ No | Placeholder | ✅ MessageEngine |
| Type Safety | ❌ No | ❌ No | ✅ TypeScript |
| State Management | Vanilla JS | Vanilla JS | React Hooks |
| UI Components | Custom HTML | Custom HTML | Agora AI UIKit |
| Word-level Rendering | ❌ No | ❌ No | ✅ Yes |
| Agent Visualizer | ❌ No | ❌ No | ✅ Lottie Animations |
| Chat UI | ❌ No | Basic | ✅ ConvoTextStream |
| Production Ready | Testing only | Yes | ✅ Yes |
| Component Reuse | ❌ No | ❌ No | ✅ Yes |

## Integration with Conversational-AI-Demo

This implementation uses the component library approach from agora-ai-uikit. The package branch provides **transcript rendering** but not **message sending**.

If you need to **send messages to the agent** (text chat, images, interrupts), refer to the `ConversationalAIAPI` class in Conversational-AI-Demo:

```typescript
// Example: Sending text to agent (not implemented in this client)
import { ConversationalAIAPI } from "conversational-ai-demo"

const api = ConversationalAIAPI.getInstance()
await api.sendText(agentUserId, {
  text: "Hello!",
  priority: "interrupted",
  responseInterruptable: true
})
```

See [COMPARISON.md](./COMPARISON.md) for detailed comparison of:
- MessageEngine (agora-ai-uikit) vs ConversationalAIAPI (Conversational-AI-Demo)
- UI components and architecture differences
- When to use each approach

## Troubleshooting

### Build Warnings

**Warning: Multiple lockfiles detected**
- This is a Next.js workspace detection warning
- Can be safely ignored or resolved by adding `turbopack.root` to `next.config.js`

### Runtime Issues

**"window is not defined"**
- Already handled via dynamic import with `ssr: false` in `app/page.tsx:10`
- Do not remove the dynamic import wrapper

**No transcriptions appearing**
- Check browser console for MessageEngine logs: "MessageEngine update: ..."
- Verify agent is sending RTC stream messages (check Network tab)
- Ensure agent UID matches the configured value (default: "0")
- Confirm backend is properly starting the agent

**Microphone not working**
- Grant microphone permissions when browser prompts
- Check browser console for "Permission denied" errors
- Verify audio device is selected correctly (use browser settings)
- Ensure no other application is using the microphone

**Agent not detected as speaking**
- Verify agent is publishing audio track
- Check remote user subscription in browser console
- Confirm agent UID is correct

**TypeScript errors during build**
- Run `npm install` to ensure all type definitions are installed
- Check `tsconfig.json` paths configuration: `"@/*": ["./*"]`
- Verify all imports use `@/` alias, not relative paths like `../`

### Development Tips

**Hot Module Replacement (HMR) issues**
- Restart dev server: `npm run dev`
- Clear .next folder: `rm -rf .next && npm run dev`

**Component import errors**
- Ensure all agora-ui components use `@/` imports:
  ```typescript
  import { cn } from "@/lib/utils"  // ✅ Correct
  import { cn } from "../lib/utils" // ❌ Wrong
  ```

## Contributing

When adding new features:

1. Use existing agora-ai-uikit components when possible
2. Keep imports using `@/` alias for consistency
3. Update TypeScript types appropriately
4. Test build with `npm run build` before committing
5. Update this README if adding new major features

## Next Steps

1. ✅ MessageEngine integration - **DONE**
2. ✅ ConvoTextStream for chat UI - **DONE**
3. ⬜ Add RTM messaging for sending text to agent (see ConversationalAIAPI)
4. ⬜ Add interrupt functionality
5. ⬜ Add conversation export (JSON/CSV)
6. ⬜ Deploy to Vercel or similar platform
7. ⬜ Add audio recording/playback
8. ⬜ Implement theme customization

## Enhanced Audio Visualization (client-ui-kit)

This project includes enhanced audio visualization components with improved smoothness and configurability. See [client-ui-kit/README.md](./client-ui-kit/README.md) for detailed API documentation.

**Components:**
- `SimpleVisualizer` - CSS-based visualizer (no canvas flickering)
- `LiveWaveform` - Enhanced canvas visualizer with configurable alpha
- `useAudioVisualization` - Volume-based visualization hook with threshold, smoothing, and decay controls

**Quick Example:**
```tsx
import { useAudioVisualization } from "@/client-ui-kit"
import { SimpleVisualizer } from "@/client-ui-kit"

const frequencyData = useAudioVisualization(localAudioTrack, isConnected, {
  threshold: 0.15,      // Noise floor
  barCount: 24,         // Number of bars
  amplification: 4.0,   // Volume boost
  volumeDecay: 0.95,    // Decay smoothing
})

<SimpleVisualizer data={frequencyData} />
```

For complete API documentation, configuration options, and usage examples, see the [Client UI Kit README](./client-ui-kit/README.md).

## License

MIT

## Related Documentation

- [Client UI Kit API Documentation](./client-ui-kit/README.md) - Enhanced audio visualization components
- [agora-ai-uikit Package Branch](https://github.com/AgoraIO-Community/agora-ai-uikit/tree/package) - Source of components
- [Comparison with Conversational-AI-Demo](./COMPARISON.md) - Detailed comparison
- [Agora RTC SDK Documentation](https://docs.agora.io/en/voice-calling/overview/product-overview)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
