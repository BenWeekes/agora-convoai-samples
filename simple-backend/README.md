# Simple Backend

## Overview

AWS Lambda (Python) function that receives params via HTTPS, generates token, uid, and channel, then calls the Agent REST API.

## Features

- Token generation for Agora channels
- User ID and channel management
- REST API integration with Agora AI Agent
- Serverless deployment with AWS Lambda

## Coming Soon

Sample code and implementation details will be added here.

## Quick Links

- [Back to Main Repository](../)
- [Agora Server-side Documentation](https://docs.agora.io/en/video-calling/develop/authentication-workflow)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## Prerequisites

- AWS Account
- Python 3.8 or higher
- Agora Account with API Key and Secret
- Agora AI Agent credentials

## Architecture

```
Client Request → API Gateway → Lambda Function → Agora API
                                      ↓
                              Token Generation
                                      ↓
                              Return Credentials
```

## Environment Variables

- `AGORA_APP_ID`: Your Agora App ID
- `AGORA_APP_CERTIFICATE`: Your Agora App Certificate
- `AGORA_AGENT_API_KEY`: Agora AI Agent API Key

## Getting Started

1. Clone this repository
2. Install Python dependencies
3. Configure environment variables
4. Deploy to AWS Lambda
5. Set up API Gateway endpoint

## Support

For questions and support, please visit the [Agora Developer Community](https://www.agora.io/en/community/).
