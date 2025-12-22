# Agora ConvoAI Samples - Current State

**Last Updated:** 2025-12-22

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
- **Status:** Running (bash_id: 37b1d8)
- **Location:** `/Users/benweekes/work/agora-convoai-samples/react-voice-client`
- **Command:** `npm run dev`

## Project Architecture

The project uses a **copy-based architecture** where the SDK and UI Kit are reference implementations that sample applications copy into their project.

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

### How Samples Work

Sample applications copy the SDK and UI Kit code:

```bash
# From react-voice-client directory
cp -r ../client-sdk/conversational-ai-api ./
cp -r ../client-sdk/react ./
mkdir -p components/agora-ui
cp ../client-ui-kit/components/* components/agora-ui/
```

This allows samples to run standalone without package resolution issues.

## Recent Changes

### 1. Copy-based Architecture (2025-12-22)
- Switched from package-based to copy-based architecture for sample apps
- Copied SDK code into `react-voice-client`:
  - Copied `/client-sdk/conversational-ai-api` directory
  - Copied `/client-sdk/react` directory
- Copied UI Kit components into `react-voice-client`:
  - Copied `/client-ui-kit/components` to `/components/agora-ui`
- Updated all imports to use local paths:
  - Uses `@/conversational-ai-api` (local)
  - Uses `@/components/agora-ui` (local)
- Fixed component imports to use `@/lib/utils` instead of relative paths
- Updated README documentation in all 3 directories to explain copy-based approach
- Application now builds successfully without module resolution errors

### 2. SDK README Improvements
- Removed emojis, ticks, and icons
- Added detailed Table of Contents with method/event names
- Moved Architecture section near start
- Removed Status and Credits sections
- Removed Bundle Size and Performance sections (moved to UI Kit)

### 3. UI Kit README Improvements
- Put all components into `components/` subfolder
- Removed emojis, ticks, and icons
- Added comprehensive TOC grouped by category:
  - Voice Components
  - Chat Components
  - Video Components
  - UI Primitives

## Installation & Setup

### First Time Setup

1. **Install Backend Dependencies:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/simple-backend
   pip install -r requirements.txt  # (if exists)
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/react-voice-client
   npm install --legacy-peer-deps
   ```

### Starting Services

1. **Start Backend:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/simple-backend
   PORT=8082 python3 local_server.py
   ```

2. **Start Frontend:**
   ```bash
   cd /Users/benweekes/work/agora-convoai-samples/react-voice-client
   npm run dev
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
