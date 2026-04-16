# User Service - eCommerce Application

## Overview
Spring Boot microservice responsible for user management and authentication integration.

## Responsibilities
- **User Registration**: Create user accounts
- **User Profile Management**: Retrieve and update user information
- **Role Assignment**: Assign roles (Customer, Supplier, Data Steward)
- **Authentication Integration**: Integrate with AWS Cognito
- **User Validation**: Validate user credentials and roles

## Architecture
- **Framework**: Spring Boot 3.1
- **Database**: Independent database (separate from other services)
- **ORM**: Spring Data JPA
- **Port**: 8081

## API Endpoints (Placeholder)
- `GET /users/{userId}` - Get user profile
- `POST /users` - Create user
- `PUT /users/{userId}` - Update user profile
- `GET /users/{userId}/roles` - Get user roles

## Database Schema
- User entity with role information
- Cognito ID mapping
- User metadata and timestamps

## Setup
```bash
cd backend/user-service
mvn clean install
mvn spring-boot:run
```

## Environment Configuration
Configure database connection, AWS Cognito integration, and service port in `application.yml`.
