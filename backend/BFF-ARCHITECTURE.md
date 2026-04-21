# Backend for Frontend (BFF) Architecture

## Overview

The BFF is a Node.js/Express server that acts as the **single API gateway** between the React frontend (port 3000) and all 4 microservices (ports 8081-8084). It provides:

- **Unified API** - Frontend talks to one port (3001) instead of 4 different microservice ports
- **Authentication** - Centralized JWT token handling and generation
- **Authorization** - Role-based access control before reaching microservices
- **Error Handling** - Consistent error responses across all endpoints
- **Security** - Validates tokens, enforces roles, handles CORS

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  FRONTEND (React, Port 3000)                                             │
│  ├── Dashboard                                                            │
│  ├── Products                                                             │
│  ├── Orders                                                               │
│  ├── Suppliers                                                            │
│  └── Login                                                                │
│                                                                           │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    HTTP Request/Response
                    (with JWT Bearer token)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  BFF (Node.js/Express, Port 3001)                                        │
│  ├── /auth/login             Authentication                              │
│  ├── /auth/me                Get current user                            │
│  ├── /auth/roles             Get available roles                         │
│  ├── /api/users              → User Service (8081)                       │
│  ├── /api/products           → Product Service (8082)                    │
│  ├── /api/orders             → Order Service (8083)                      │
│  └── /api/suppliers          → Supply Service (8084)                     │
│                                                                           │
│  [Middleware]                                                             │
│  ├── CORS (enable frontend access)                                        │
│  ├── JWT Authentication (validates token)                                 │
│  ├── Role-based Access Control (protects endpoints)                       │
│  ├── Error Handler (formats errors)                                       │
│  └── Request Logger (Morgan)                                              │
│                                                                           │
└─────────────┬───────────────┬──────────────────┬──────────────┬─────────┘
              │               │                  │              │
    HTTP GET/POST    Forward with JWT token     │              │
    /api/users       (add to Authorization header)              │
              │               │                  │              │
              ▼               ▼                  ▼              ▼
        ┌─────────┐     ┌──────────┐      ┌──────────┐  ┌───────────┐
        │  User   │     │ Product  │      │  Order   │  │ Supplier  │
        │ Service │     │ Service  │      │ Service  │  │ Service   │
        │ (8081)  │     │ (8082)   │      │ (8083)   │  │ (8084)    │
        └─────────┘     └──────────┘      └──────────┘  └───────────┘
        
        [Spring Boot Microservices]
        Each with H2 database
```

## API Flow Explanation

### Step 1: Login (No Authentication Required)

```
Frontend                                BFF                           User Service
   │                                     │                                 │
   │──(1) POST /auth/login──────────────>│                                 │
   │     {username, password}            │                                 │
   │                                     │──(2) Find user in testUsers──► │
   │                                     │     (local validation)          │
   │                                     │                                 │
   │<────(3) JWT token────────────────────│                                 │
   │   {accessToken, user, expiresIn}    │                                 │
   │                                     │                                 │
```

**No call to microservices for login** - BFF validates credentials locally and generates JWT token.

### Step 2: Authenticated API Request (e.g., List Users)

```
Frontend                                BFF                           User Service
   │                                     │                                 │
   │──(1) GET /api/users──────────────────│                                │
   │     Headers: {                       │                                │
   │       Authorization: Bearer <token>  │                                │
   │     }                                │                                │
   │                                     │                                │
   │                         (2) Verify JWT token locally                 │
   │                             Extract: {id, username, role}           │
   │                                     │                                │
   │                         (3) Check role (DATA_STEWARD required)       │
   │                                     │                                │
   │                                     │──(4) Forward to User Service──>│
   │                                     │     GET /api/users             │
   │                                     │     Auth: Bearer <token>       │
   │                                     │                                │
   │                                     │<────(5) Users list────────────│
   │                                     │     [{user1}, {user2}, ...]    │
   │                                     │                                │
   │<────(6) Users list────────────────────│                                │
   │     [{user1}, {user2}, ...]         │                                 │
   │                                     │                                 │
```

### Step 3: Authorization Failure (Insufficient Role)

```
Frontend                                BFF
   │                                     │
   │──(1) POST /api/products/approve──────│
   │     (Customer tries admin action)   │
   │     Headers: {                       │
   │       Authorization: Bearer <token>  │ (role: CUSTOMER)
   │     }                                │
   │                                     │
   │                         (2) Verify JWT token
   │                             role = CUSTOMER
   │                         (3) Check if DATA_STEWARD
   │                             ✗ FAILED
   │                     (4) Return 403 Forbidden
   │<────403 Forbidden─────────────────────│
   │     {error: "Access denied,          │
   │      Required role: DATA_STEWARD"}   │
   │                                     │
```

**No request sent to microservice** - BFF rejects at authorization layer.

## Error Handling

### Error Types

1. **Authentication Errors (401)**
   - Missing token
   - Invalid token
   - Expired token

2. **Authorization Errors (403)**
   - User doesn't have required role
   - Access denied to resource

3. **Service Unavailable (503)**
   - Microservice not responding
   - Connection refused

4. **Gateway Timeout (504)**
   - Microservice taking too long
   - Request timeout (30 seconds)

5. **Bad Request (400)**
   - Invalid input parameters
   - Missing required fields

6. **Not Found (404)**
   - Resource doesn't exist
   - Invalid endpoint

7. **Service Error (5xx)**
   - Microservice returned error
   - Database issues

### Error Response Format

```json
{
  "error": {
    "status": 401,
    "message": "Invalid or expired token",
    "timestamp": "2026-04-16T12:00:00Z",
    "details": {
      "service": "User Service",
      "code": "UNAUTHORIZED"
    }
  }
}
```

### Error Handling Flow

```
BFF Request Handler
       │
       ├─(1) Validate JWT token
       │   ├─ Missing?    → 401 Unauthorized
       │   ├─ Invalid?    → 401 Unauthorized
       │   └─ Expired?    → 401 Unauthorized
       │
       ├─(2) Check user role
       │   └─ Insufficient? → 403 Forbidden
       │
       ├─(3) Forward to microservice
       │   ├─ Service down?      → 503 Service Unavailable
       │   ├─ Request timeout?   → 504 Gateway Timeout
       │   ├─ Returns error?     → Pass through service status
       │   └─ Success?          → 200/201/etc with data
       │
       └─(4) Return response to frontend
```

### Example: Service Unavailable

If **Product Service (8082) is down**:

```bash
# Frontend request
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products

# BFF tries to reach Product Service
# Connection refused (ECONNREFUSED)

# BFF response to frontend:
{
  "error": {
    "status": 503,
    "message": "Service Unavailable: Product Service is not responding",
    "timestamp": "2026-04-16T12:00:00Z",
    "details": {
      "service": "Product Service",
      "code": "SERVICE_UNAVAILABLE"
    }
  }
}
```

## Request Processing Pipeline

```
Request arrives at BFF
       │
       ▼
┌──────────────────────────────────┐
│ CORS Handler                     │
│ Allow requests from              │
│ http://localhost:3000            │
└───────────┬──────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ Body Parser                      │
│ Parse JSON body                  │
└───────────┬──────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ Morgan Logger                    │
│ Log request method, path, status │
└───────────┬──────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ Route Matching                   │
│ Find matching route              │
└───────────┬──────────────────────┘
            │
     ┌──────┴──────┐
     │             │
   Auth?       No Auth?
  (POST login)  (GET /health)
     │             │
     ▼             ▼
  Handle      Handle
  Login       Health Check
             │
             └─────┬─────────────────┐
                   │                 │
                JWT Auth          No Auth
               Required          Required
                   │
                   ▼
    ┌─────────────────────────────┐
    │ Verify JWT Token            │
    │ Extract: id, username, role │
    └──────────┬──────────────────┘
               │
          Valid?
         ✓ Yes  ✗ No
           │      │
           │      ▼
           │   Return 401
           │   Unauthorized
           │
           ▼
┌──────────────────────────────────┐
│ Check Role (if required)         │
│ Verify user has permission       │
└──────────┬───────────────────────┘
           │
      Allowed?
     ✓ Yes  ✗ No
       │      │
       │      ▼
       │   Return 403
       │   Forbidden
       │
       ▼
┌──────────────────────────────────┐
│ Forward to Microservice          │
│ Add Authorization header         │
│ Send request with timeout        │
└──────────┬───────────────────────┘
           │
     ┌─────┴──────────┬──────────────┐
     │                │              │
   Success         Error         Timeout
  (200-201)      (4xx-5xx)    (504 timeout)
     │                │              │
     └────┬───────────┴──────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ Error Handler (if needed)        │
│ Format and normalize error       │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Send Response to Frontend        │
│ Status code + JSON body          │
└──────────────────────────────────┘
```

## Endpoint Security Matrix

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/auth/login` | POST | ✗ | — | Login without token |
| `/auth/me` | GET | ✓ | — | Any role |
| `/api/users` | GET | ✓ | DATA_STEWARD | List users |
| `/api/users` | POST | ✓ | DATA_STEWARD | Create user |
| `/api/products` | GET | ✓ | — | Browse products |
| `/api/products` | POST | ✓ | SUPPLIER | Create product |
| `/api/products/{id}/approve` | POST | ✓ | DATA_STEWARD | Approve product |
| `/api/orders` | POST | ✓ | CUSTOMER | Create order |
| `/api/orders/{id}/confirm` | PATCH | ✓ | CUSTOMER | Confirm order |
| `/api/suppliers` | POST | ✓ | — | Register supplier |
| `/api/suppliers/{id}/approve` | POST | ✓ | DATA_STEWARD | Approve supplier |

## Configuration

### Environment Variables (.env)

```bash
PORT=3001                              # BFF server port
NODE_ENV=development                   # Environment
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000     # CORS origin

# Microservice URLs
USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLIER_SERVICE_URL=http://localhost:8084

LOG_LEVEL=combined                     # Morgan logging level
```

### Test Users

Built-in test users (no database lookup):

| Username | Password | Role | Access |
|----------|----------|------|--------|
| customer1 | pass123 | CUSTOMER | Browse products, create orders |
| supplier1 | pass123 | SUPPLIER | Register, create products |
| admin1 | pass123 | DATA_STEWARD | Approve items, manage users |

## Testing the BFF

### 1. Health Check (no auth)

```bash
curl http://localhost:3001/health
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}'

# Response:
# {
#   "accessToken": "eyJhbGc...",
#   "expiresIn": "1h",
#   "user": {
#     "id": 1,
#     "username": "customer1",
#     "role": "CUSTOMER"
#   }
# }
```

### 3. Get Current User (with token)

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/auth/me
```

### 4. Get Products (with token)

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
```

### 5. Try Unauthorized Action (customer approving product)

```bash
curl -X POST http://localhost:3001/api/products/1/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response (403 Forbidden):
# {
#   "error": {
#     "status": 403,
#     "message": "Access denied. Required role: DATA_STEWARD"
#   }
# }
```

## Installation & Setup

### Prerequisites

- Node.js v14+ installed
- npm (comes with Node.js)

### Installation

```bash
# Navigate to BFF directory
cd backend/bff

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Or production start
npm start
```

### Expected Output

```
✓ BFF Server running on port 3001
✓ Environment: development
✓ Frontend: http://localhost:3000
✓ CORS enabled

Connected Services:
  • User Service:              http://localhost:8081
  • Product Service:          http://localhost:8082
  • Order Service:            http://localhost:8083
  • Supply Management Service: http://localhost:8084
```

## Benefits of BFF Architecture

1. **Single Entry Point** - Frontend only talks to port 3001
2. **Centralized Auth** - Token generation in one place
3. **Consistent Error Handling** - All errors formatted the same way
4. **Role-Based Access** - Enforced at gateway, not at each service
5. **CORS Handling** - Solved at BFF, not duplicated per service
6. **Request/Response Transform** - Adapt service data for frontend needs
7. **Service Independence** - Can add/update microservices without frontend changes
8. **Rate Limiting** - Can be added at BFF level
9. **Logging & Monitoring** - Centralized request tracking
10. **API Versioning** - Can evolve APIs without breaking frontend

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start BFF**: `npm start`
3. **Start microservices**: Run Maven services on ports 8081-8084
4. **Test login**: POST to `/auth/login`
5. **Test proxy**: GET `/api/products` with JWT token
6. **Monitor logs**: Watch terminal for request/error logs

---

**Key Takeaway**: The BFF is a lightweight gateway that provides a unified, secure interface to all microservices. It handles authentication, authorization, error handling, and request proxying—keeping the frontend simple and services independent.
