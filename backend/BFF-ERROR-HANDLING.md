# BFF Error Handling Guide

## Overview

The BFF implements a comprehensive, centralized error handling system that:

1. **Validates and authenticates** all requests
2. **Checks authorization** before routing
3. **Handles service failures** gracefully
4. **Formats all errors** consistently
5. **Logs errors** for debugging

## Error Categories

### 1. Authentication Errors (401 Unauthorized)

Occur when JWT token is missing, invalid, or expired.

#### Missing Token

**Trigger:** No `Authorization` header

```bash
curl http://localhost:3001/api/users
```

**Response:**
```json
{
  "error": {
    "status": 401,
    "message": "Missing authorization token",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

#### Invalid Token

**Trigger:** Malformed token or wrong secret

```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:3001/api/users
```

**Response:**
```json
{
  "error": {
    "status": 401,
    "message": "Invalid or expired token",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

#### Expired Token

**Trigger:** Token older than 1 hour

```bash
# Token from 1 hour ago
curl -H "Authorization: Bearer oldtoken123" http://localhost:3001/api/users
```

**Response:**
```json
{
  "error": {
    "status": 401,
    "message": "Invalid or expired token",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

---

### 2. Authorization Errors (403 Forbidden)

Occur when user doesn't have required role.

#### Insufficient Role

**Trigger:** Customer tries admin action

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

# Customer cannot approve products
curl -X POST http://localhost:3001/api/products/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "error": {
    "status": 403,
    "message": "Access denied. Required role: DATA_STEWARD",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

**Matrix of Role-Based Access:**

| Endpoint | Action | CUSTOMER | SUPPLIER | DATA_STEWARD |
|----------|--------|----------|----------|--------------|
| POST /api/products/{id}/approve | Approve | ❌ | ❌ | ✅ |
| POST /api/products/{id}/reject | Reject | ❌ | ❌ | ✅ |
| POST /api/products | Create | ❌ | ✅ | ✅ |
| POST /api/orders | Create | ✅ | ❌ | ✅ |
| POST /api/orders/{id}/confirm | Confirm | ✅ | ❌ | ✅ |
| PATCH /api/orders/{id}/ship | Ship | ❌ | ❌ | ✅ |
| GET /api/users | List | ❌ | ❌ | ✅ |
| POST /api/suppliers/{id}/approve | Approve | ❌ | ❌ | ✅ |

---

### 3. Service Unavailable Errors (503)

Occur when microservice is not responding.

#### Service Down

**Trigger:** Kill Product Service before request

```bash
# Product Service is down
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
```

**Response:**
```json
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

**BFF Logs:**
```
[ERROR] Connection refused - Cannot reach Product Service at http://localhost:8082
[ERROR] ECONNREFUSED: Connection refused at http://localhost:8082
```

---

### 4. Gateway Timeout Errors (504)

Occur when microservice takes too long to respond (30+ seconds).

#### Service Slow/Hung

**Trigger:** Service hanging or network latency

```bash
# Service is slow
curl --max-time 60 -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
```

**Response:**
```json
{
  "error": {
    "status": 504,
    "message": "Gateway Timeout: Request to Product Service timed out",
    "timestamp": "2026-04-16T12:00:00Z",
    "details": {
      "service": "Product Service",
      "code": "GATEWAY_TIMEOUT"
    }
  }
}
```

**BFF Configuration for Timeout:**
```javascript
// In config.js
httpTimeout: 30000  // 30 seconds
```

---

### 5. Bad Request Errors (400)

Occur when request body is invalid.

#### Missing Required Field

**Trigger:** Incomplete request body

```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1"}'  # missing password
```

**Response:**
```json
{
  "error": {
    "status": 400,
    "message": "Username and password are required",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

#### Invalid JSON

**Trigger:** Malformed JSON

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{invalid json}'
```

**Response:**
```json
{
  "error": {
    "status": 400,
    "message": "Invalid JSON in request body",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

---

### 6. Not Found Errors (404)

Occur when resource doesn't exist.

#### Resource Not Found (from Service)

**Trigger:** Request with invalid ID

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/users/99999
```

**Response:**
```json
{
  "error": {
    "status": 404,
    "message": "User not found",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

#### Endpoint Not Found

**Trigger:** Invalid BFF endpoint

```bash
curl http://localhost:3001/api/invalid/endpoint
```

**Response:**
```json
{
  "error": {
    "status": 404,
    "message": "Endpoint not found",
    "path": "/api/invalid/endpoint",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

---

### 7. Conflict Errors (409)

Occur when duplicate resource already exists.

#### Duplicate Username

**Trigger:** Create user with existing username

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "email": "new@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }'
```

**Response:**
```json
{
  "error": {
    "status": 409,
    "message": "User already exists (username or email)",
    "timestamp": "2026-04-16T12:00:00Z"
  }
}
```

---

## Error Response Format

All errors follow this consistent schema:

```json
{
  "error": {
    "status": 401,                         // HTTP status code
    "message": "Invalid or expired token", // Human-readable message
    "timestamp": "2026-04-16T12:00:00Z",  // When error occurred
    "details": {                           // Optional technical details
      "service": "User Service",           // Which service failed
      "code": "UNAUTHORIZED"               // Error code enum
    }
  }
}
```

---

## Error Handling Flow

### Sequential Processing

```
BFF Receives Request
       │
       ├─ Parse body (400 if invalid JSON)
       ├─ Check route matches (404 if not found)
       │
       ├─ Route is public (e.g., /health, /auth/login)
       │   └─ Handle without auth
       │
       └─ Route is protected
           │
           ├─ Extract token from Authorization header
           │   └─ Missing? Return 401
               │
           ├─ Verify JWT token signature
           │   └─ Invalid/expired? Return 401
           │
           ├─ Check user role (if required)
           │   └─ Insufficient? Return 403
           │
           └─ Forward to microservice
               │
               ├─ Connection refused? Return 503
               ├─ Timeout (30s)? Return 504
               ├─ Service error? Return service status
               └─ Success? Return 200/201/etc
```

---

## Error Handling Code

### Authentication Middleware (auth.js)

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractToken(authHeader);

  // Missing token
  if (!token) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Missing authorization token',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Invalid or expired token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      },
    });
  }

  req.user = decoded;
  req.token = token;
  next();
}
```

### Service Error Handler (errorHandler.js)

```javascript
function handleServiceError(error, serviceName) {
  // Connection errors
  if (error.code === 'ECONNREFUSED') {
    return new APIError(
      503,
      `Service Unavailable: ${serviceName} is not responding`,
      { service: serviceName, code: 'SERVICE_UNAVAILABLE' },
      error
    );
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new APIError(
      504,
      `Gateway Timeout: Request to ${serviceName} timed out`,
      { service: serviceName, code: 'GATEWAY_TIMEOUT' },
      error
    );
  }

  // HTTP errors from service
  if (error.response) {
    const { status, data } = error.response;
    return new APIError(
      status || 500,
      data?.message || `Error from ${serviceName}`,
      data || { service: serviceName, status },
      error
    );
  }

  // Generic errors
  return new APIError(
    500,
    `Internal Server Error: ${error.message}`,
    { service: serviceName },
    error
  );
}
```

### Centralized Error Handler Middleware

```javascript
function errorHandler(err, req, res, next) {
  const error = err instanceof APIError ? err : new APIError(500, err.message, null, err);

  const statusCode = error.statusCode || 500;
  const response = formatErrorResponse(error);

  res.status(statusCode).json(response);
}
```

---

## Testing Error Scenarios

### Test 1: Missing Token

```bash
curl -i http://localhost:3001/api/users

# HTTP/1.1 401 Unauthorized
# {
#   "error": {
#     "status": 401,
#     "message": "Missing authorization token"
#   }
# }
```

### Test 2: Invalid Role

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

curl -i -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","firstName":"Test","lastName":"User","role":"CUSTOMER"}'

# HTTP/1.1 403 Forbidden
# {
#   "error": {
#     "status": 403,
#     "message": "Access denied. Required role: DATA_STEWARD"
#   }
# }
```

### Test 3: Service Unavailable

```bash
# Kill Product Service before this
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products

# HTTP/1.1 503 Service Unavailable
# {
#   "error": {
#     "status": 503,
#     "message": "Service Unavailable: Product Service is not responding"
#   }
# }
```

### Test 4: Invalid JSON

```bash
curl -i -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{bad json}'

# HTTP/1.1 400 Bad Request
# (exact error depends on JSON parser)
```

---

## Debugging Tips

### Enable Request Logging

```bash
# Set LOG_LEVEL in .env
LOG_LEVEL=combined

# Or start BFF with:
LOG_LEVEL=dev npm start
```

**Output includes:**
- Request method, path, status code
- Response time
- Body size
- Any errors with timestamps

### Check Service Health

```bash
# User Service
curl http://localhost:8081/health

# Product Service
curl http://localhost:8082/health

# Order Service
curl http://localhost:8083/health

# Supply Management Service
curl http://localhost:8084/health
```

### Inspect Microservice Logs

Each service logs to console. Look for:
- "Started XyzServiceApplication"
- "ERROR" or "WARN" messages
- HTTP status codes in logs

### Monitor BFF in Real-Time

```bash
# Start BFF with development mode
npm run dev

# Logs appear as requests happen
```

---

## Production Considerations

1. **Change JWT Secret**
   ```bash
   # .env
   JWT_SECRET=your-production-secret-key-min-32-chars
   ```

2. **Set Correct Frontend URL**
   ```bash
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Update Service URLs**
   ```bash
   USER_SERVICE_URL=https://internal-user-service:8081
   PRODUCT_SERVICE_URL=https://internal-product-service:8082
   ORDER_SERVICE_URL=https://internal-order-service:8083
   SUPPLIER_SERVICE_URL=https://internal-supplier-service:8084
   ```

4. **Enable HTTPS**
   - Use NGINX or Express HTTPS server
   - Set secure cookies: `secure: true`

5. **Rate Limiting** (optional enhancement)
   - Install: `npm install express-rate-limit`
   - Limit login attempts
   - Limit API calls per user

6. **Add Request Validation**
   - Use `express-validator` library
   - Validate email formats, field lengths, etc.

---

## Summary

The BFF error handling is:
- ✅ **Comprehensive** - Covers all error scenarios
- ✅ **Consistent** - Same format for all errors
- ✅ **Informative** - Clear messages for debugging
- ✅ **Secure** - Shows minimal details to prevent info leakage
- ✅ **Centered** - All errors formatted in one place
- ✅ **Logged** - Every error is recorded for monitoring

This ensures the frontend always knows what went wrong and can display appropriate messages to users.
