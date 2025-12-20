# Agora Conversational AI UI Kit

React component library for building voice AI user interfaces with Agora.

**Status**: ✅ Production-Ready | 📦 Ready for Packaging

---

## Features

- **Voice AI Components** - MicButton, AgentVisualizer, audio visualizations
- **Conversation UI** - Message bubbles, avatars, streaming text
- **Audio Visualizations** - Waveforms, frequency bars, PTS-synced animations
- **Tailwind CSS** - Full Tailwind support with customization via `cn()` utility
- **TypeScript** - Comprehensive type definitions
- **Accessible** - ARIA attributes and keyboard navigation
- **Mobile-Responsive** - Touch-friendly sizing and layouts

---

## Installation

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
```

Copy the `client-ui-kit` folder into your project and import components:

```typescript
import { MicButton, AgentVisualizer, Conversation } from './client-ui-kit'
```

---

## Components

### Core Components

#### MicButton

Microphone button with built-in audio visualization and state management.

**Props:**

```typescript
interface MicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: 'idle' | 'listening' | 'processing' | 'error'  // default: 'idle'
  icon?: React.ReactNode                                  // Custom icon
  showErrorBadge?: boolean                                // Show error indicator
  audioData?: number[]                                    // 0-1 normalized frequency data
}
```

**Usage:**

```typescript
import { MicButton } from './client-ui-kit'
import { Mic, MicOff } from 'lucide-react'

<MicButton
  state={isListening ? 'listening' : 'idle'}
  icon={isMuted ? <MicOff /> : <Mic />}
  audioData={frequencyData}
  onClick={toggleMute}
  className="flex-1"
/>
```

**Features:**
- Automatic state styling (idle/listening/processing/error)
- Integrated audio visualization (SimpleVisualizer)
- Error badge support for permission issues
- Keeps visualizer visible when muted (icon changes only)

---

#### AgentVisualizer

Animated agent state visualizer with pulsing circles.

**Props:**

```typescript
interface AgentVisualizerProps {
  state: 'not-joined' | 'listening' | 'talking' | 'thinking'
  size?: 'sm' | 'md' | 'lg'  // default: 'md'
  className?: string
}
```

**Usage:**

```typescript
import { AgentVisualizer } from './client-ui-kit'

<AgentVisualizer
  state={isAgentSpeaking ? 'talking' : 'listening'}
  size="sm"
/>
```

**States:**
- `not-joined` - Gray, no animation
- `listening` - Blue, gentle pulse
- `talking` - Green, active animation
- `thinking` - Purple, processing animation

**Sizes:**
- `sm` - 128px (mobile/compact)
- `md` - 192px (default)
- `lg` - 256px (full screen)

---

#### Avatar

User/agent avatar with customizable size and colors.

**Props:**

```typescript
interface AvatarProps {
  src?: string           // Image URL
  alt?: string           // Alt text
  initials?: string      // Fallback initials (e.g., "JD")
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**Usage:**

```typescript
import { Avatar } from './client-ui-kit'

{/* Image avatar */}
<Avatar src="/avatar.jpg" alt="User" size="sm" />

{/* Initials fallback */}
<Avatar initials="A" size="sm" />  {/* Agent */}
<Avatar initials="U" size="sm" />  {/* User */}
```

**Sizes:**
- `sm` - 32px
- `md` - 40px
- `lg` - 48px

---

#### Conversation

Container for chat messages with auto-scroll and styling.

**Props:**

```typescript
interface ConversationProps {
  children: React.ReactNode
  height?: string        // CSS height value (default: '100%')
  className?: string
}

interface ConversationContentProps {
  children: React.ReactNode
  className?: string
}
```

**Usage:**

```typescript
import { Conversation, ConversationContent } from './client-ui-kit'

<Conversation height="500px" className="flex-1">
  <ConversationContent>
    {/* Messages go here */}
  </ConversationContent>
</Conversation>
```

**Features:**
- Auto-scrolls to bottom on new messages
- Smooth scroll behavior
- Styled scrollbar
- Flexible height control

---

#### Message

Individual message bubble for user or agent.

**Props:**

```typescript
interface MessageProps {
  from: 'user' | 'assistant'
  avatar?: React.ReactNode
  children: React.ReactNode
  className?: string
}

interface MessageContentProps {
  children: React.ReactNode
  className?: string
}
```

**Usage:**

```typescript
import { Message, MessageContent, Response, Avatar } from './client-ui-kit'

<Message
  from="assistant"
  avatar={<Avatar initials="A" size="sm" />}
>
  <MessageContent>
    <Response>Hello! How can I help you?</Response>
  </MessageContent>
</Message>

<Message
  from="user"
  avatar={<Avatar initials="U" size="sm" />}
>
  <MessageContent>
    <Response>I need help with my account.</Response>
  </MessageContent>
</Message>
```

**Layout:**
- `from="assistant"` - Avatar on left, message on right
- `from="user"` - Avatar on right, message on left
- Responsive flex layout

---

#### Response

Text content wrapper for messages.

**Props:**

```typescript
interface ResponseProps {
  children: React.ReactNode
  className?: string
}
```

**Usage:**

```typescript
import { Response } from './client-ui-kit'

<Response>This is the message text</Response>
```

**Features:**
- Pre-styled text formatting
- Supports markdown-style text
- Proper spacing and line height

---

### Audio Visualizers

#### SimpleVisualizer

Compact horizontal bar visualizer for MicButton.

**Props:**

```typescript
interface SimpleVisualizerProps {
  data: number[]         // 0-1 normalized frequency data
  className?: string
}
```

**Usage:**

```typescript
import { SimpleVisualizer } from './client-ui-kit'

<SimpleVisualizer
  data={frequencyData}
  className="text-blue-500"
/>
```

**Features:**
- 8 vertical bars
- Smooth animations
- Customizable color via className
- Fixed width (64px)

---

#### AudioVisualizer

Full-featured frequency bar visualizer.

**Props:**

```typescript
interface AudioVisualizerProps {
  data: number[]         // 0-1 normalized frequency data
  barCount?: number      // Number of bars (default: 32)
  barWidth?: number      // Bar width in px (default: 4)
  barGap?: number        // Gap between bars (default: 2)
  height?: number        // Height in px (default: 100)
  color?: string         // Bar color (default: 'rgb(59, 130, 246)')
  className?: string
}
```

**Usage:**

```typescript
import { AudioVisualizer } from './client-ui-kit'

<AudioVisualizer
  data={frequencyData}
  barCount={64}
  barWidth={3}
  barGap={1}
  height={120}
  color="rgb(34, 197, 94)"
/>
```

**Features:**
- Configurable bar count and sizing
- Custom colors
- Canvas-based rendering
- High-performance animations

---

#### LiveWaveform

Animated waveform with PTS synchronization support.

**Props:**

```typescript
interface LiveWaveformProps {
  audioData: number[]    // 0-1 normalized audio data
  isActive?: boolean     // Enable animation
  color?: string         // Waveform color
  height?: number        // Height in px (default: 60)
  className?: string
}
```

**Usage:**

```typescript
import { LiveWaveform } from './client-ui-kit'

<LiveWaveform
  audioData={waveformData}
  isActive={isAgentSpeaking}
  color="#10b981"
  height={80}
/>
```

**Features:**
- Smooth waveform rendering
- Active/inactive states
- SVG-based for scalability
- Supports PTS-based timing

---

#### MicButtonWithVisualizer

Combined mic button and full audio visualizer (alternative to MicButton).

**Props:**

```typescript
interface MicButtonWithVisualizerProps {
  isActive: boolean
  isMuted: boolean
  onClick: () => void
  audioData?: number[]
  className?: string
}
```

**Usage:**

```typescript
import { MicButtonWithVisualizer } from './client-ui-kit'

<MicButtonWithVisualizer
  isActive={isConnected}
  isMuted={isMuted}
  onClick={toggleMute}
  audioData={frequencyData}
/>
```

**Features:**
- Large mic icon with surrounding visualizer
- Active/inactive states
- Mute indicator
- Integrated frequency bars

---

### Text Components

#### ConvoTextStream

Streaming text component with typewriter effect.

**Props:**

```typescript
interface ConvoTextStreamProps {
  text: string
  speed?: number         // Characters per second (default: 20)
  onComplete?: () => void
  className?: string
}
```

**Usage:**

```typescript
import { ConvoTextStream } from './client-ui-kit'

<ConvoTextStream
  text="This text will stream in character by character"
  speed={30}
  onComplete={() => console.log('Done!')}
/>
```

**Features:**
- Smooth character-by-character streaming
- Configurable speed
- Completion callback
- Supports markdown

---

### UI Primitives

#### Button

Standard button with variant support.

**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**Usage:**

```typescript
import { Button } from './client-ui-kit'

<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="destructive" size="lg">
  Delete
</Button>
```

**Variants:**
- `default` - Primary blue background
- `outline` - Border only, transparent background
- `ghost` - No border, hover background
- `destructive` - Red background for dangerous actions

---

#### IconButton

Circular icon button for actions.

**Props:**

```typescript
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
  className?: string
}
```

**Usage:**

```typescript
import { IconButton } from './client-ui-kit'
import { Settings } from 'lucide-react'

<IconButton
  icon={<Settings />}
  size="md"
  onClick={openSettings}
/>
```

**Sizes:**
- `sm` - 32px
- `md` - 40px
- `lg` - 48px

---

#### Card

Simple card container.

**Props:**

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}
```

**Usage:**

```typescript
import { Card } from './client-ui-kit'

<Card className="p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

---

#### Chip

Small label/tag component.

**Props:**

```typescript
interface ChipProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}
```

**Usage:**

```typescript
import { Chip } from './client-ui-kit'

<Chip variant="success">Active</Chip>
<Chip variant="error">Offline</Chip>
```

---

### Form Components

#### ValuePicker

Value selector with increment/decrement buttons.

**Props:**

```typescript
interface ValuePickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}
```

**Usage:**

```typescript
import { ValuePicker } from './client-ui-kit'

<ValuePicker
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={5}
  label="Volume"
/>
```

---

#### MicSelector

Microphone device selector dropdown.

**Props:**

```typescript
interface MicSelectorProps {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string
  onDeviceChange: (deviceId: string) => void
  className?: string
}
```

**Usage:**

```typescript
import { MicSelector } from './client-ui-kit'

<MicSelector
  devices={microphoneDevices}
  selectedDeviceId={currentMicId}
  onDeviceChange={handleMicChange}
/>
```

**Features:**
- Lists available microphones
- Shows current selection
- Device switching
- Integrated with Agora audio track API

---

### Layout Components

#### DropdownMenu

Dropdown menu component (uses Radix UI pattern).

**Usage:**

```typescript
import { DropdownMenu } from './client-ui-kit'

{/* See component file for full API */}
```

---

#### Command

Command palette component (keyboard shortcuts).

**Usage:**

```typescript
import { Command } from './client-ui-kit'

{/* See component file for full API */}
```

---

#### Popover

Popover/tooltip component.

**Usage:**

```typescript
import { Popover } from './client-ui-kit'

{/* See component file for full API */}
```

---

## Usage Patterns

### Voice Chat Interface

```typescript
import {
  MicButton,
  AgentVisualizer,
  Conversation,
  ConversationContent,
  Message,
  MessageContent,
  Response,
  Avatar
} from './client-ui-kit'

function VoiceChat() {
  const { transcript, isAgentSpeaking, isMuted, toggleMute } = useVoiceAI()

  return (
    <div className="flex h-screen">
      {/* Left: Agent Status */}
      <div className="w-96 p-6">
        <AgentVisualizer
          state={isAgentSpeaking ? 'talking' : 'listening'}
          size="md"
        />

        <MicButton
          state={isMuted ? 'idle' : 'listening'}
          icon={isMuted ? <MicOff /> : <Mic />}
          audioData={frequencyData}
          onClick={toggleMute}
          className="mt-6 w-full"
        />
      </div>

      {/* Right: Conversation */}
      <div className="flex-1">
        <Conversation className="flex-1">
          <ConversationContent>
            {transcript.map((msg, idx) => (
              <Message
                key={idx}
                from={msg.uid === 0 ? 'assistant' : 'user'}
                avatar={<Avatar initials={msg.uid === 0 ? 'A' : 'U'} />}
              >
                <MessageContent>
                  <Response>{msg.text}</Response>
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
      </div>
    </div>
  )
}
```

---

### Mobile-Responsive Layout

```typescript
function MobileVoiceChat() {
  return (
    <div className="flex flex-col h-screen">
      {/* Mobile: Status Bar */}
      <div className="md:hidden flex items-center p-3 border-b">
        <div className={cn(
          "w-3 h-3 rounded-full",
          isAgentSpeaking ? "bg-green-500" : "bg-blue-500"
        )} />
        <span className="ml-3">
          {isAgentSpeaking ? 'Agent Speaking' : 'Listening'}
        </span>
      </div>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {/* Messages */}
        </ConversationContent>
      </Conversation>

      {/* Mobile: Bottom Controls */}
      <div className="md:hidden flex gap-3 p-4 border-t">
        <MicButton
          state={micState}
          icon={isMuted ? <MicOff /> : <Mic />}
          audioData={frequencyData}
          onClick={toggleMute}
          className="flex-1 min-h-[48px]"
        />
        <button className="flex-1 min-h-[48px]">
          End Call
        </button>
      </div>
    </div>
  )
}
```

---

### Audio Visualization

```typescript
import { AudioVisualizer, SimpleVisualizer, LiveWaveform } from './client-ui-kit'

function AudioViz() {
  const frequencyData = useAudioVisualization(audioTrack, isConnected)

  return (
    <div>
      {/* Simple bars in button */}
      <SimpleVisualizer data={frequencyData} className="text-blue-500" />

      {/* Full frequency visualizer */}
      <AudioVisualizer
        data={frequencyData}
        barCount={64}
        height={120}
        color="rgb(34, 197, 94)"
      />

      {/* Waveform */}
      <LiveWaveform
        audioData={frequencyData}
        isActive={isPlaying}
        height={80}
      />
    </div>
  )
}
```

---

## Theming

All components use Tailwind CSS and support the `cn()` utility for custom styling:

```typescript
import { cn } from '@/lib/utils'

<MicButton
  className={cn(
    "custom-class",
    isActive && "active-state"
  )}
/>
```

### Custom Colors

Override default colors via Tailwind config or inline styles:

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0066ff',
        'agent-active': '#10b981',
        'agent-idle': '#3b82f6'
      }
    }
  }
}
```

---

## Accessibility

All components follow accessibility best practices:

- **Keyboard Navigation** - All interactive components support Tab, Enter, Space
- **ARIA Attributes** - Proper roles, labels, and descriptions
- **Focus Management** - Visible focus indicators
- **Screen Reader Support** - Semantic HTML and ARIA labels
- **Touch Targets** - Minimum 48px touch targets on mobile

---

## Performance

**Optimization Tips:**

1. **Audio Visualization** - Throttle updates to 100ms for smooth 10fps rendering
2. **Conversation Scrolling** - Use `will-change: scroll-position` for smooth scroll
3. **Message List** - Use `key` prop with unique IDs for efficient React reconciliation
4. **Memoization** - Wrap expensive components in `React.memo()` when needed

**Example:**

```typescript
const MemoizedMessage = React.memo(Message)

{transcript.map((msg) => (
  <MemoizedMessage key={msg.turn_id} {...msg} />
))}
```

---

## Dependencies

**Required:**
- React ≥18.0.0
- Tailwind CSS ≥3.0.0
- lucide-react (for icons)
- clsx (for className merging)
- tailwind-merge (for Tailwind class deduplication)

**Optional:**
- class-variance-authority (for variant-based styling)

---

## File Structure

```
/client-ui-kit
├── index.ts                         # Main exports
├── README.md                        # This file
│
├── mic-button.tsx                   # Microphone button
├── agent-visualizer.tsx             # Agent state visualizer
├── avatar.tsx                       # Avatar component
├── conversation.tsx                 # Conversation container
├── message.tsx                      # Message bubble
├── response.tsx                     # Response text
│
├── audio-visualizer.tsx             # Full audio visualizer
├── simple-visualizer.tsx            # Compact visualizer
├── live-waveform.tsx                # Waveform visualizer
├── mic-button-with-visualizer.tsx   # Combined mic+viz
│
├── convo-text-stream.tsx            # Streaming text
│
├── button.tsx                       # Button primitive
├── icon-button.tsx                  # Icon button
├── card.tsx                         # Card container
├── chip.tsx                         # Chip/tag
│
├── value-picker.tsx                 # Value selector
├── mic-selector.tsx                 # Mic device selector
│
├── dropdown-menu.tsx                # Dropdown menu
├── command.tsx                      # Command palette
├── popover.tsx                      # Popover/tooltip
│
└── hello-world.tsx                  # Demo component
```

---

## Examples

See `react-voice-client/components/VoiceClient.tsx` for a complete production example using these components.

---

## License

MIT
