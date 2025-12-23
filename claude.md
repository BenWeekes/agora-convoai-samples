# Agora ConvoAI Samples - Current State

**Last Updated:** 2025-12-23

## Running Services

### Backend
- **Port:** 8082
- **URL:** http://localhost:8082
- **Status:** Running (bash_id: 2a6917)
- **Location:** `/Users/benweekes/work/agora-convoai-samples/simple-backend`
- **Command:** `PORT=8082 python3 local_server.py`

### Frontend
- **Port:** 8083
- **URL:** http://localhost:8083
- **Status:** Running (bash_id: 498e28)
- **Location:** `/Users/benweekes/work/agora-convoai-samples`
- **Command:** `pnpm dev`

## Project Architecture

The project uses a **pnpm workspace monorepo** where the SDK and UI Kit are proper packages consumed by sample applications.

### Repository Structure

```
agora-convoai-samples/
├── client-sdk/                    # Reference SDK Implementation
│   ├── conversational-ai-api/     # Core SDK
│   │   ├── helper/
│   │   │   ├── rtc.ts
│   │   │   └── rtm.ts
│   │   ├── utils/
│   │   │   └── sub-render.ts
│   │   ├── type.ts
│   │   └── index.ts
│   └── react/                     # React hooks
│       └── use-conversational-ai.ts
│
├── client-ui-kit/                 # Reference UI Components
│   ├── components/                # All UI components
│   │   ├── mic-button.tsx
│   │   ├── agent-visualizer.tsx
│   │   ├── conversation.tsx
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts              # cn() utility
│   └── index.ts
│
└── react-voice-client/            # Sample Application
    ├── conversational-ai-api/     # Copied from ../client-sdk
    ├── react/                     # Copied from ../client-sdk
    ├── components/
    │   ├── VoiceClient.tsx
    │   └── agora-ui/              # Copied from ../client-ui-kit
    ├── hooks/
    ├── lib/
    └── package.json               # npm dependencies only
```

### Workspace Packages

Packages are linked via pnpm workspace protocol:

```json
{
  "dependencies": {
    "@agora/conversational-ai": "workspace:*",
    "@agora/conversational-ai-react": "workspace:*",
    "@agora/ui-kit": "workspace:*"
  }
}
```

Benefits:
- **Single source of truth** - Update SDK/UI Kit once, reflects everywhere
- **Proper package development** - Packages can be published to npm
- **External consumption** - Apps outside this repo can use published packages
- **Dependency hoisting** - pnpm correctly resolves peer dependencies

## Recent Changes

### 1. ConvoTextStream Scrollbar Fix (2025-12-23)
- **Problem:** Chat scrollbar not visible and cannot scroll when screen fills with messages
- **Root cause:** Chatbox container lacked max-height constraint, causing it to expand indefinitely
- **Solutions applied:**
  - Added `max-h-[600px]` to chatbox container in convo-text-stream.tsx:185
  - This enables the inner `overflow-auto` container to scroll properly
  - Fixed all import paths from `@/` to relative paths in convo-text-stream.tsx and mic-selector.tsx
- **Files changed:**
  - `/client-ui-kit/components/chat/convo-text-stream.tsx` - Added max-height, fixed imports
  - `/client-ui-kit/components/voice/mic-selector.tsx` - Fixed imports to use relative paths
- **Commits:** a60ac60, 5abfe12, c85edbf

### 2. Quickstart Guide Update (2025-12-23)
- Updated `convo-ai-quickstart/README.md` with comprehensive improvements
- Added TOC with all major sections
- Added "RTC and RTM Explained" section clarifying their roles
- Added three implementation approaches:
  - Approach A: Use SDK + UI Kit packages (recommended)
  - Approach B: Use sample as template
  - Approach C: Bare RTC/RTM implementation
- Added SDK Package Reference section with:
  - ConversationalAIAPI usage examples
  - RTCHelper usage examples
  - RTMHelper usage examples
  - React hooks (useConversationalAI) usage examples
- Added UI Kit Components section with:
  - Voice components (AgentVisualizer, MicButton, AudioVisualizer, MicSelector)
  - Chat components (Conversation, Message, ConvoTextStream)
  - Video components (Avatar)
- Updated sample references (react-voice-client instead of complete-voice-client)
- Added token generation with RTC+RTM example
- Removed emojis, ticks, and icons
- **Commit:** 8e87a0b

### 3. pnpm Workspace Implementation (2025-12-22)
- Implemented pnpm workspace monorepo for proper package development
- Added `pnpm-workspace.yaml` to configure workspace
- Added root `package.json` with workspace scripts (`pnpm dev`, `pnpm build`)
- Updated `react-voice-client` to use `workspace:*` protocol for package references
- Updated all imports to use package names (`@agora/conversational-ai`, `@agora/ui-kit`)
- Removed copied code - packages now properly linked via workspace
- Benefits: Single source of truth, publishable packages, external consumption ready
- Installation: `pnpm install` from repo root
- Development: `pnpm dev` from repo root

### 4. Audio Visualizer Fixes (2025-12-22)
- **Problem:** Visualizer bars disappeared after moving components to ui-kit package
- **Root cause:** Tailwind CSS v4 wasn't scanning workspace packages for class names
- **Solutions applied:**
  - Added `@source "../client-ui-kit/**/*.{ts,tsx}"` to `react-voice-client/app/globals.css:4`
  - Switched SimpleVisualizer to inline styles (backgroundColor) instead of Tailwind classes
  - Fixed mute/unmute freeze by passing `isConnected && !isMuted` to useAudioVisualization
  - Centered visualizer content with `justify-center` in mic-button.tsx:74
- **Files changed:**
  - `/react-voice-client/app/globals.css` - Added @source directive
  - `/client-ui-kit/components/simple-visualizer.tsx` - Inline styles for bars
  - `/client-ui-kit/components/mic-button.tsx` - Center content
  - `/react-voice-client/components/VoiceClient.tsx` - Fix mute/unmute restart

### 5. Copy-based Architecture (2025-12-22) - SUPERSEDED
- Initial attempt at copy-based architecture
- Replaced by pnpm workspaces (above)

### 6. SDK README Improvements
- Removed emojis, ticks, and icons
- Added detailed Table of Contents with method/event names
- Moved Architecture section near start
- Removed Status and Credits sections
- Removed Bundle Size and Performance sections (moved to UI Kit)

### 7. UI Kit README Improvements
- Put all components into `components/` subfolder
- Removed emojis, ticks, and icons
- Added comprehensive TOC grouped by category:
  - Voice Components
  - Chat Components
  - Video Components
  - UI Primitives

### 8. Git History Cleanup (2025-12-22)
- **Problem:** Git push failed - node_modules was committed in f56db945 (119MB file exceeds GitHub's 100MB limit)
- **Solution:**
  - Created .gitignore to prevent future node_modules commits
  - Used git filter-branch to remove node_modules from all commit history
  - Cleaned up git refs and ran garbage collection
  - Force pushed cleaned history to remote
- **Files added:** `.gitignore`
- **Commits affected:** All 35 commits in repository history rewritten

## Installation & Setup

### First Time Setup

1. **Install pnpm (if not already installed):**
   ```bash
   npm install -g pnpm
   ```

2. **Install All Workspace Dependencies:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples
   pnpm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/simple-backend
   pip install -r requirements.txt  # (if exists)
   ```

### Starting Services

1. **Start Backend:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/simple-backend
   PORT=8082 python3 local_server.py
   ```

2. **Start Frontend:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples
   pnpm dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:8083
   - Backend: http://localhost:8082

## Known Issues

1. **Peer Dependency Conflicts:**
   - agora-rtm@2.2.3-1 requires agora-rtc-sdk-ng@4.23.0
   - Project uses agora-rtc-sdk-ng@4.24.2
   - **Workaround:** Use `npm install --legacy-peer-deps`
   - **Status:** Not a blocker - app works fine with this configuration

## Key Files

### SDK Package
- `/client-sdk/conversational-ai-api/package.json` - SDK package config
- `/client-sdk/conversational-ai-api/index.ts` - Main SDK exports
- `/client-sdk/react/package.json` - React hooks package config
- `/client-sdk/react/index.ts` - React hooks exports

### UI Kit Package
- `/client-ui-kit/package.json` - UI kit package config
- `/client-ui-kit/index.ts` - Component exports
- `/client-ui-kit/lib/utils.ts` - Shared utilities (cn function)

### Example App
- `/react-voice-client/package.json` - App dependencies with file: references
- `/react-voice-client/components/VoiceClient.tsx` - Main voice client component
- `/react-voice-client/hooks/useAgoraVoiceClient.ts` - Custom hook using SDK

## Next Steps

- [ ] Fix production build issues
- [ ] Add video components (LocalVideoDisplay, RemoteVideoDisplay) to UI kit
- [ ] Publish packages to npm (when ready)
- [ ] Add comprehensive tests
- [ ] Create migration guide for existing apps
