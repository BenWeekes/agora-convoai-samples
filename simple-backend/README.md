# Simple Backend

Python backend for starting/stopping Agora AI voice agents and returning an
Agora RTC token for the client to join the same channel. Supports both local
development and AWS Lambda deployment.

## Usage

### Local Development

**1. Install dependencies:**

```bash
pip3 install -r requirements-local.txt
```

**2. Configure environment:**

Create `.env` file with your credentials:

```bash
# Agora settings
APP_ID=YOUR_AGORA_APP_ID
APP_CERTIFICATE=
AGENT_AUTH_HEADER=YOUR_AGORA_AUTH_HEADER

# LLM settings
LLM_API_KEY=YOUR_OPENAI_API_KEY
LLM_MODEL=gpt-4o
LLM_URL=https://api.openai.com/v1/chat/completions

# TTS settings - Rime
TTS_VENDOR=rime
RIME_API_KEY=YOUR_RIME_API_KEY

# ASR settings - Ares (default, no key needed)
ASR_VENDOR=ares

# AIVAD settings
ENABLE_AIVAD=false

# Prompts and messages
DEFAULT_GREETING=Hey there, I am Quiz Master Bella, would you like me to quiz you on capital cities?
DEFAULT_PROMPT=You are Bella, a quiz master who asks capital city questions. Keep responses under 30 words and immediately ask the next question after announcing the result.
```

See `.env.example` for all available configuration options.

**3. Run server:**

```bash
python3 local_server.py
# Or specify custom port:
PORT=8082 python3 local_server.py
```

Server runs on http://localhost:8081 (default) or custom port via `PORT` env
var.

**4. Test the endpoints:**

**Start agent in channel:**

```bash
curl "http://localhost:8081/start-agent?channel=test"
```

Response includes `agent_id` needed for stopping the agent:

```json
{
  "channel": "test",
  "appid": "YOUR_APP_ID",
  "token": "...",
  "uid": "101",
  "agent_response": {
    "status_code": 200,
    "response": "{\"agent_id\":\"abc123...\"}"
  }
}
```

**Stop agent:**

```bash
# Use agent_id from start response
curl "http://localhost:8081/hangup-agent?agent_id=abc123"
```

**Other examples:**

```bash
# Token-only mode (no agent started)
curl "http://localhost:8081/start-agent?channel=test&connect=false"

# With profile override
curl "http://localhost:8081/start-agent?channel=test&profile=sales"

# Health check
curl "http://localhost:8081/health"
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

All configuration via environment variables. See `.env.example` for complete
list.

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

## Running Tests

The backend includes a comprehensive test suite using pytest with unit and
integration tests.

**Run all tests:**

```bash
pytest
```

**Run with coverage:**

```bash
pytest --cov=core --cov-report=term-missing
```

**Run only unit tests:**

```bash
pytest -m unit
```

**Run only integration tests:**

```bash
pytest -m integration
```

**Run with verbose output:**

```bash
pytest -v
```

**Test Structure:**

```
tests/
├── conftest.py              # Fixtures and configuration
├── test_utils.py            # core/utils.py tests
├── test_tokens.py           # core/tokens.py tests
├── test_agent.py            # core/agent.py tests
├── test_config.py           # core/config.py tests
└── integration/
    └── test_endpoints.py    # Flask endpoint tests
```

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
