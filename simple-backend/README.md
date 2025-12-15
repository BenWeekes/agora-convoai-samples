# Simple Backend

Python backend for starting/stopping Agora AI voice agents. Supports both local development and AWS Lambda deployment.

## Usage

### Local Development

**1. Install dependencies:**
```bash
pip install -r requirements-local.txt
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

**3. Run server:**
```bash
python3 local_server.py
# Or specify custom port:
PORT=8082 python3 local_server.py
```

Server runs on http://localhost:8081 (default) or custom port via `PORT` env var

**Endpoints:**
- `GET /start-agent?channel=test` - Start agent in channel
- `GET /hangup-agent?agent_id=xxx` - Stop agent
- `GET /health` - Health check

**Examples:**
```bash
# Start agent in channel "test"
curl "http://localhost:8081/start-agent?channel=test"

# Token-only mode (no agent)
curl "http://localhost:8081/start-agent?channel=test&connect=false"

# With profile override
curl "http://localhost:8081/start-agent?channel=test&profile=sales"

# Stop agent
curl "http://localhost:8081/hangup-agent?agent_id=AGENT_ID"
```

### AWS Lambda Deployment

**1. Package for Lambda:**
```bash
zip -r lambda.zip lambda_handler.py core/
```

**2. Upload to AWS Lambda**

**3. Set environment variables in Lambda console:**
- `APP_ID`
- `APP_CERTIFICATE`
- `AGENT_AUTH_HEADER`
- `LLM_API_KEY`
- `TTS_VENDOR`
- `RIME_API_KEY` (if using Rime)
- See `.env.example` for all options

**4. Configure API Gateway trigger**

## Configuration

All configuration via environment variables. See `.env.example` for complete list.

**Required:**
- `APP_ID` - Agora App ID
- `AGENT_AUTH_HEADER` - Agora API authorization
- `LLM_API_KEY` - OpenAI or LLM API key
- `TTS_VENDOR` - TTS provider (rime, elevenlabs, openai, cartesia)
- Vendor-specific keys (e.g., `RIME_API_KEY`)

**Optional:**
- `APP_CERTIFICATE` - For token security (leave blank for testing)
- `ASR_VENDOR` - Speech recognition (default: ares, no key needed)
- `ENABLE_AIVAD` - AI voice activity detection (default: true)
- Profile overrides: Suffix any var with `_profilename`

## Architecture

```
simple-backend/
├── core/              # Shared business logic
│   ├── config.py     # Environment variables
│   ├── tokens.py     # v007 token generation
│   ├── agent.py      # Agent API calls
│   └── utils.py      # Utilities
├── lambda_handler.py # AWS Lambda wrapper
├── local_server.py   # Flask development server
└── .env              # Local config (gitignored)
```

Core modules work identically in both Lambda and local environments.

## Profile Support

Override config per use case:

```bash
# Set profile-specific env vars
TTS_VOICE_ID_sales=voice123
DEFAULT_PROMPT_sales=You are a sales assistant...

# Use profile
curl "http://localhost:8081/start-agent?channel=test&profile=sales"
```

Variables checked in order:
1. `VAR_NAME_profile` (if profile specified)
2. `VAR_NAME` (base variable)
3. Default value (hardcoded)
