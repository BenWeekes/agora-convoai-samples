# <img src="./assets/agora-logo.svg" alt="Agora" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Agora Conversational AI

A guide to understanding and implementing Agora voice and video AI agents

## System Architecture

![System Architecture Diagram](./assets/system.svg)

Your backend serves the client app, generates tokens and credentials, then calls
the Agora Agent REST API to start the AI agent. Both client and agent join the
same channel via SD-RTN where audio, video, and transcription data flow
bidirectionally in real-time.

## Architecture Overview

### Voice AI Client

Your front-end application (web, mobile, or desktop) that captures user inputs
and plays out the AI agent's responses. Built with the Agora RTC SDK and
optionally components from the Agora Conversational AI agent-ui-kit used in the
samples.

### Your Backend Services

Your server-side application that authenticates users, generates Agora tokens,
and orchestrates the AI agent. It serves the client app and calls the Agora REST
API to start/stop agent instances.

### Agora SD-RTN

Agora's Software-Defined Real-Time Network. A global low-latency network that
routes audio, video, and data streams between participants in real-time.

### AI Agent Instance

A managed AI agent that joins the channel as a participant. It listens to user
audio, processes it through STT → LLM → TTS, and streams the response back.

## AI Coding Assistant Guide

**Comprehensive implementation guide for AI agents** → [AGENT.md](./AGENT.md)

## Server Side

### Useful Links

- **[Enable Conversational AI](https://docs.agora.io/en/conversational-ai/get-started/manage-agora-account)** -
  Create an Agora AppID and enable Conversational AI
- **[RESTful authentication](https://docs.agora.io/en/conversational-ai/rest-api/restful-authentication)** -
  Create a RESTful API Authentication Token
- **[start agent](https://docs.agora.io/en/conversational-ai/rest-api/agent/join)** -
  API docs to start an AI Agent
- **[stop agent](https://docs.agora.io/en/conversational-ai/rest-api/agent/leave)** -
  API docs to stop an AI Agent

### Sample

**[Simple Backend](./simple-backend/)** Python backend for managing AI agents
and generating RTC credentials. Supports local development, cloud instances, and
AWS Lambda deployment.

## Client Side

### Core Packages

- **[agent-toolkit](./agent-toolkit/)** - Core SDK with RTC/RTM helpers and
  React hooks
- **[agent-ui-kit](./agent-ui-kit/)** - React UI components for voice, chat, and
  video

### Samples

![Avatar Client Screenshot](./assets/client-avatar-screenshot.png)

**[Simple Voice AI Client](./simple-voice-client/)** Standalone HTML/JavaScript
client for testing voice agents. Maintains persistent RTC connection allowing
agents to join and leave without client reconnection.

**[HTML/JS Voice AI Client](./complete-voice-client/)** Full-featured vanilla
JavaScript client demonstrating end-to-end integration with backend for agent
initialization and voice interaction.

**[React Voice Client](./react-voice-client/)** Responsive React/Next.js voice
client built with SDK packages and UI Kit. Features TypeScript, real-time
transcription display, voice controls, and integrated text chat.

**[React Video Client with Avatar](./react-video-client-avatar/)** React/Next.js
client with video avatar and local camera support. Includes responsive layouts
and multi-stream video rendering.
