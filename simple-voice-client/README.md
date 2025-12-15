# Simple Voice AI Client

Simple HTML client for connecting to an Agora AI voice agent. Agents can come and go. Useful for testing.

## Usage

Open `index.html` in a browser. Configure via form or URL parameters:

**URL Parameters:**
```
index.html?appid=YOUR_APP_ID&channel=YOUR_CHANNEL&token=YOUR_TOKEN&uid=123&title=My%20Agent
```

**Parameters:**
- `appid` (required) - Agora App ID
- `channel` (required) - Channel name
- `token` (optional) - Authentication token
- `uid` (optional) - User ID (auto-generated if not provided)
- `title` (optional) - Session title (defaults to "Voice AI Agent")

## Features

- Real-time audio visualization
- Microphone selection
- Mute/unmute controls
- No build step required
