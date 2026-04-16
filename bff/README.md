# Backend for Frontend (BFF) - eCommerce Application

## Overview
Node.js Express server that acts as a single entry point for the React frontend.

## Responsibilities
- **Single Entry Point**: Frontend communicates only with BFF
- **Service Aggregation**: Combines responses from multiple backend microservices
- **Request Routing**: Routes frontend requests to appropriate backend services
- **Authentication Middleware**: Validates JWT tokens from AWS Cognito
- **Error Handling**: Centralized error handling and transformation
- **CORS Management**: Handles cross-origin requests from frontend

## Architecture
- **Framework**: Express.js with TypeScript
- **Communication**: HTTP/REST with backend microservices
- **Authentication**: JWT validation from AWS Cognito

## Key Features
- Middleware for authentication and request validation
- Route definitions for all microservices
- Request aggregation and response transformation
- Centralized error handling
- CORS configuration for frontend

## Microservices Integration
BFF communicates with:
- **User Service** (port 8081)
- **Product Service** (port 8082)
- **Order Service** (port 8083)
- **Supply Management Service** (port 8084)

## Setup
```bash
npm install
npm run build
npm start
```

## Development
```bash
npm run dev
```

## Environment Variables
See `.env.example` - Configure all microservice endpoints and Cognito settings.
