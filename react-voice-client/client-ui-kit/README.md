# Client UI Kit - Audio Visualization Components

Enhanced UI components for audio visualization in Agora voice applications, featuring smooth animations and configurable behavior.

## Components

### SimpleVisualizer

A CSS-based audio visualizer that displays bars lighting up from left to right based on volume. No canvas flickering, smooth transitions.

**Import:**
```typescript
import { SimpleVisualizer } from "@/client-ui-kit/components/simple-visualizer"
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | - | **Required.** Array of binary values (0 or 1) representing bar states |
| `className` | `string` | - | Additional CSS classes |
| `activeColor` | `string` | `"bg-gray-700"` | Tailwind class for active/lit bars |
| `inactiveColor` | `string` | `"bg-gray-300"` | Tailwind class for inactive/unlit bars |
| `barWidth` | `number` | `3` | Bar width in pixels |
| `barHeight` | `number` | `16` | Bar height in pixels |
| `barGap` | `number` | `2` | Gap between bars in pixels |

**Example:**
```tsx
const frequencyData = useAudioVisualization(localAudioTrack, isConnected)

<SimpleVisualizer
  data={frequencyData}
  activeColor="bg-blue-600"
  inactiveColor="bg-gray-200"
  barHeight={20}
/>
```

---

### LiveWaveform (Enhanced)

Canvas-based audio waveform visualization with configurable alpha behavior.

**New Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minAlpha` | `number \| null` | `null` | Minimum opacity (0-1). When `null`, uses value directly (new behavior) |
| `alphaRange` | `number` | `1.0` | Additional opacity range. Formula: `minAlpha + value * alphaRange` |

**Migration from old behavior:**
```tsx
// Old behavior (40%-100% opacity range):
<LiveWaveform minAlpha={0.4} alphaRange={0.6} ... />

// New behavior (0%-100% opacity range):
<LiveWaveform minAlpha={null} ... />
// or simply:
<LiveWaveform ... />
```

---

## Hooks

### useAudioVisualization

Analyzes audio track and provides volume-based visualization data. Calculates overall volume and returns binary array (0 or 1) that lights up from left to right.

**Import:**
```typescript
import { useAudioVisualization, AudioVisualizationOptions } from "@/client-ui-kit/hooks/useAudioVisualization"
```

**Signature:**
```typescript
function useAudioVisualization(
  track: IMicrophoneAudioTrack | null,
  enabled: boolean = true,
  options?: AudioVisualizationOptions
): number[]
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `track` | `IMicrophoneAudioTrack \| null` | - | Agora microphone audio track to analyze |
| `enabled` | `boolean` | `true` | Whether visualization is active |
| `options` | `AudioVisualizationOptions` | `{}` | Configuration options (see below) |

**AudioVisualizationOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0.15` | Minimum volume (0-1) before bars start lighting. Prevents noise |
| `barCount` | `number` | `24` | Number of visualization bars to generate |
| `amplification` | `number` | `4.0` | Volume amplification multiplier for better visibility |
| `volumeDecay` | `number` | `0.95` | Decay rate (0-1) for volume smoothing. Higher = slower decay |
| `attackRate` | `number` | `0.3` | Attack interpolation factor (0-1). Higher = faster response |
| `updateInterval` | `number` | `33` | Update interval in milliseconds (33ms = 30fps) |

**Returns:** `number[]` - Array of binary values (0 or 1), length = `barCount`

**Example:**
```tsx
import { useAudioVisualization } from "@/client-ui-kit/hooks/useAudioVisualization"
import { SimpleVisualizer } from "@/client-ui-kit/components/simple-visualizer"

function MicVisualizer({ audioTrack, isActive }) {
  const frequencyData = useAudioVisualization(
    audioTrack,
    isActive,
    {
      threshold: 0.2,      // Higher threshold - less sensitive to noise
      barCount: 20,        // Fewer bars
      amplification: 5.0,  // More amplification
      volumeDecay: 0.97,   // Slower decay - bars hold longer
      attackRate: 0.5,     // Faster response to volume increases
      updateInterval: 16   // 60fps updates
    }
  )

  return <SimpleVisualizer data={frequencyData} />
}
```

**How it works:**

1. **Volume Calculation:** Analyzes all frequency bands via Web Audio API and calculates average volume
2. **Threshold Application:** Applies minimum threshold to filter out background noise
3. **Smoothing:** Applies attack/decay envelope for smooth transitions
   - Attack: Instant jump to higher volumes
   - Decay: Gradual fade using `volumeDecay` factor
4. **Bar Calculation:** Converts smoothed volume to number of lit bars (0 to `barCount`)
5. **Binary Output:** Returns array where `1` = lit bar, `0` = unlit bar

**Tuning Tips:**

- **Too sensitive?** → Increase `threshold` (0.15 → 0.25)
- **Bars fade too fast?** → Increase `volumeDecay` (0.95 → 0.98)
- **Not responsive enough?** → Increase `attackRate` (0.3 → 0.5)
- **Bars not tall enough?** → Increase `amplification` (4.0 → 5.0)
- **Choppy animation?** → Decrease `updateInterval` (33 → 16ms for 60fps)

---

## Installation

1. Copy files to your project:
   ```bash
   cp -r client-ui-kit/components/* components/
   cp -r client-ui-kit/hooks/* hooks/
   ```

2. Update import paths in your components

3. Install dependencies (if not already installed):
   ```bash
   npm install agora-rtc-sdk-ng
   ```

---

## Complete Example

```tsx
"use client"

import { useState } from "react"
import { useAgoraVoiceClient } from "@/hooks/useAgoraVoiceClient"
import { useAudioVisualization } from "@/client-ui-kit/hooks/useAudioVisualization"
import { SimpleVisualizer } from "@/client-ui-kit/components/simple-visualizer"
import { MicButton } from "@/components/agora-ui/mic-button"

export function VoiceInterface() {
  const {
    isConnected,
    isMuted,
    micState,
    localAudioTrack,
    toggleMute,
  } = useAgoraVoiceClient()

  // Get audio visualization data
  const frequencyData = useAudioVisualization(
    localAudioTrack,
    isConnected && !isMuted,
    {
      threshold: 0.15,
      barCount: 24,
      amplification: 4.0,
      volumeDecay: 0.95,
      attackRate: 0.3,
      updateInterval: 33
    }
  )

  return (
    <div>
      <MicButton
        state={micState}
        audioData={frequencyData}
        onClick={toggleMute}
      />

      {/* Or use SimpleVisualizer directly */}
      <SimpleVisualizer
        data={frequencyData}
        activeColor="bg-blue-600"
        inactiveColor="bg-gray-200"
        barHeight={16}
      />
    </div>
  )
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│ IMicrophoneAudioTrack (Agora SDK)               │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│ useAudioVisualization Hook                      │
│ • Web Audio API (AnalyserNode)                  │
│ • FFT Analysis (fftSize: 256)                   │
│ • Volume calculation                            │
│ • Threshold filtering                           │
│ • Attack/Decay smoothing                        │
└────────────────┬────────────────────────────────┘
                 │
                 v (number[] - binary 0/1)
                 │
         ┌───────┴────────┐
         │                │
         v                v
┌──────────────┐  ┌──────────────┐
│SimpleVisu... │  │LiveWaveform  │
│(CSS-based)   │  │(Canvas)      │
└──────────────┘  └──────────────┘
```

---

## Contributing Back to UI Kit

These components are designed to be contributed back to the Agora UI Kit. All parameters are configurable with sensible defaults, and the behavior is non-breaking for existing implementations.

**Changes made:**
1. **SimpleVisualizer** - New component for CSS-based visualization
2. **useAudioVisualization** - Made all parameters configurable via `AudioVisualizationOptions`
3. **LiveWaveform** - Added `minAlpha` and `alphaRange` props for alpha behavior control

**Backward compatibility:**
- LiveWaveform: Set `minAlpha={0.4}` and `alphaRange={0.6}` for old behavior
- useAudioVisualization: All new options have defaults matching previous hardcoded values

---

## License

MIT
