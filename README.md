# Agora Conversational AI Architecture

A quick-start guide to understanding how the components connect

## System Architecture Diagram

```
                    ┌───────────────────────────┐
                    │  Your Backend Services    │
                    └──────┬──────────────┬─────┘
                           │              │
                           │              │
        1. Serves app      │              │      3. Agent REST API
        2. Provides token, │              │         (token, uid, channel,
           uid, channel    │              │          agent properties)
                           │              │
                          ╱                ╲
                         ╱                  ╲
                        ↓                    ↓
            ┌──────────────────┐    ┌──────────────────┐
            │  Voice AI Client │    │ AI Agent Instance│
            │      (You)       │    │     (Agora)      │
            └─────────┬────────┘    └────────┬─────────┘
                      │                      │
                      │  Audio, Video, Data  │
                      │ ←──────────────────→ │
                      │                      │
                      │  ┌────────────────┐  │
                      └─→│  Agora SD-RTN  │←─┘
                         │   (Network)    │
                         └────────────────┘
```

## Component Overview

### Your Backend Services (You Build)
Your server-side application that authenticates users, generates Agora tokens, and orchestrates the AI agent. It serves the client app and calls the Agora REST API to start/stop agent instances.

### Voice AI Client (You Build)
Your front-end application (web, mobile, or desktop) that captures user audio/video and plays back the AI agent's responses. Built using the Agora SDK.

### Agora SD-RTN (Agora)
Agora's Software-Defined Real-Time Network. A global low-latency network that routes audio, video, and data streams between participants in real-time.

### AI Agent Instance (Agora)
A managed AI agent that joins the channel as a participant. It listens to user audio, processes it through STT → LLM → TTS, and streams the response back.

## How It Works

**1. User loads the client app**
Your backend serves the Voice AI Client to the user's device.

**2. Client requests to join a session**
Your backend generates a token, uid, and channel name, then returns these credentials to the client.

**3. Backend starts the AI agent**
Your backend calls the Agora Agent REST API with the same token, uid, channel, plus any agent configuration (system prompt, voice settings, etc.).

**4. Real-time conversation begins**
Both the client and AI agent join the same channel via SD-RTN. Audio, video, and data flow bidirectionally in real-time.

## Examples

Below are a series of examples which progress in complexity and cover both the client and server components you will need.

### For Vibe Coders
Share this link with your AI and simply ask it for the client or backend you desire.
[View Quickstart Repository](./convo-ai-quickstart/)

### Sample Projects

1. **[Simple Voice AI Client](./simple-voice-client/)**
   Takes uid, channel, and token as params to connect to an Agora channel. Agents can come and go. Useful for testing.

2. **[Simple Backend](./simple-backend/)**
   AWS Lambda (Python) function that receives params via HTTPS, generates token, uid, and channel, then calls the Agent REST API.

3. **[Complete Voice AI Client](./complete-voice-client/)**
   Full client that calls the server-side function to connect users to an AI agent.

4. **[React JS Voice AI Client](./react-voice-client/)**
   React implementation of the Voice AI Client with hooks and component-based architecture.

5. **[Voice AI Client with Chat](./voice-client-chat/)**
   Voice client with integrated text chat alongside real-time audio conversation.

6. **[Voice AI Client with Avatar & Video](./voice-client-avatar/)**
   Full-featured client with AI avatar rendering and local video capture.

7. **[App Builder Client with Avatar & Video](./appbuilder-avatar/)**
   Built with Agora App Builder for rapid prototyping with avatar and video capabilities.

## Getting Started

1. Choose a sample project from the list above
2. Follow the README in that project's folder
3. Customize for your use case

## Resources

- [Agora Documentation](https://docs.agora.io/)
- [Agora Developer Portal](https://www.agora.io/)
- [Get Your Agora API Key](https://console.agora.io/)

## License

See individual sample projects for license information.
