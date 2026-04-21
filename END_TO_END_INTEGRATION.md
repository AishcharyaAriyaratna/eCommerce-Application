# End-to-End Integration Guide

Complete guide to secure integration of frontend, BFF, and backend microservices with role-based access control and data flow validation.

---

## Table of Contents
1. Integration Architecture
2. Secure Communication Setup
3. Role-Based Access Control (RBAC)
4. Data Flow Validation
5. Common Integration Issues & Solutions
6. Debugging Tools & Techniques
7. Testing Integration
8. Monitoring & Maintenance

---

## 1. Integration Architecture

### Three-Tier Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: PRESENTATION LAYER (Frontend - React)                  │
│ Port 3000 | File: frontend/src/services/                        │
│ • LocalAuthService.ts - Local login                              │
│ • Axios - HTTP client                                            │
│ • Redux - State management                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                   HTTP/HTTPS (JSON)
              Authorization: Bearer <JWT_TOKEN>
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│ TIER 2: API GATEWAY (BFF - Node.js/Express)                     │
│ Port 3001 | File: bff/src/                                       │
│ • Authentication Layer - Token validation                        │
│ • Authorization Layer - Role checking                            │
│ • Request Routing - Service mapping                              │
│ • Error Handling - Unified responses                             │
│ • Middleware Stack - CORS, logging, validation                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
              REST API (with JWT forwarding)
         /api/users → 8081, /api/products → 8082, etc.
                          │
       ┌──────────────────┼──────────────────┬──────────────────┐
       │                  │                  │                  │
┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
│USER SERVICE │   │PRODUCT SVCE │   │ORDER SERVICE│   │SUPPLY SVCE  │
│Port 8081    │   │Port 8082    │   │Port 8083    │   │Port 8084    │
│Spring Boot  │   │Spring Boot  │   │Spring Boot  │   │Spring Boot  │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
    ┌─────┐          ┌─────┐          ┌─────┐          ┌─────┐
    │ H2  │          │ H2  │          │ H2  │          │ H2  │
    │user │          │prod │          │ ord │          │supp │
    └─────┘          └─────┘          └─────┘          └─────┘
    (Dev DB)         (Dev DB)         (Dev DB)         (Dev DB)

TIER 3: MICROSERVICES LAYER (Backend - Spring Boot)
Files: backend/[service]/src/main/java/com/ecommerce/
```

### Complete Request-Response Cycle

```
1. FRONTEND (React)
   ├─ User inputs credentials
   ├─ Call: LocalAuthService.login(username, role)
   └─ POST /auth/login → BFF

2. BFF AUTHENTICATION
   ├─ Receive login request
   ├─ Validate credentials (local users)
   ├─ Generate JWT tokens:
   │  ├─ access_token (for API calls)
   │  ├─ id_token (user info)
   │  └─ refresh_token (token renewal)
   └─ Return tokens to frontend

3. FRONTEND STORAGE
   ├─ Store access_token in localStorage
   ├─ Store id_token for user info
   └─ Add token to all subsequent API request headers

4. SUBSEQUENT API REQUEST
   ├─ Frontend: GET /api/products
   │  Header: Authorization: Bearer <access_token>
   └─ Send to BFF

5. BFF VALIDATION LAYER
   ├─ Receive request
   ├─ Extract token from header
   ├─ Decode & validate token:
   │  ├─ Check signature (JWT_SECRET)
   │  ├─ Check expiration
   │  └─ Extract user info (username, role)
   └─ Continue if valid

6. BFF AUTHORIZATION LAYER
   ├─ Check endpoint requirements
   ├─ Match user role against required role
   ├─ Return 403 if unauthorized
   └─ Continue if authorized

7. BFF ROUTING LAYER
   ├─ Match endpoint path to microservice
   ├─ Forward request:
   │  ├─ Method (GET, POST, PUT, DELETE)
   │  ├─ Headers (including Authorization)
   │  ├─ Body (if applicable)
   │  └─ Query parameters
   └─ Call microservice

8. MICROSERVICE LAYER
   ├─ Receive request from BFF
   ├─ Validate JWT token again
   ├─ Execute business logic
   ├─ Query database (H2)
   └─ Return response

9. BFF RESPONSE HANDLING
   ├─ Receive response from microservice
   ├─ Check status code
   ├─ Format response
   └─ Return to frontend

10. FRONTEND HANDLING
    ├─ Receive response
    ├─ Check status code
    ├─ Update Redux state
    ├─ Re-render UI
    └─ Show result to user
```

---

## 2. Secure Communication Setup

### 2.1 Frontend Configuration (frontend/.env)

```env
# API Gateway Configuration
REACT_APP_BFF_URL=http://localhost:3001

# Security Settings
REACT_APP_TOKEN_STORAGE=localStorage
REACT_APP_TOKEN_EXPIRY=3600000  # 1 hour in ms
REACT_APP_REFRESH_THRESHOLD=300000  # Refresh 5 min before expiry

# Environment
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### 2.2 BFF Configuration (bff/.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=local-auth
JWT_AUDIENCE=ecommerce-platform
JWT_EXPIRY=3600  # 1 hour in seconds

# Microservice URLs
USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLY_SERVICE_URL=http://localhost:8084

# Timeouts
SERVICE_TIMEOUT=30000  # 30 seconds
CONNECT_TIMEOUT=5000   # 5 seconds

# Logging
LOG_LEVEL=debug
```

### 2.3 JWT Token Structure

```javascript
// Access Token (used for API requests)
{
  "sub": "customer1",                  // User ID
  "username": "customer1",             // Username
  "role": "Customer",                  // User role
  "iss": "local-auth",                 // Issuer
  "aud": "ecommerce-platform",         // Audience
  "iat": 1713607200,                   // Issued at
  "exp": 1713610800                    // Expires in 1 hour
}

// ID Token (contains user details)
{
  "sub": "customer1",
  "username": "customer1",
  "email": "customer1@example.com",
  "role": "Customer",
  "email_verified": true,
  "iss": "local-auth",
  "aud": "ecommerce-platform",
  "iat": 1713607200,
  "exp": 1713610800
}
```

### 2.4 HTTP Headers for Secure Communication

```javascript
// Every request from Frontend to BFF must include:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,  // JWT token
  'X-Request-ID': generateRequestId(),       // Tracing
  'X-Client-Version': '1.0.0'                // Version tracking
}

// BFF forwards to Backend with same Authorization header
// Backend validates the same JWT token
```

### 2.5 HTTPS Configuration (Production)

For production deployment, enable HTTPS:

**BFF (Node.js with express-http-proxy)**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/key.pem'),
  cert: fs.readFileSync('/path/to/cert.pem')
};

https.createServer(options, app).listen(3001);
```

**Frontend**
```typescript
// frontend/src/services/LocalAuthService.ts
constructor() {
  // Use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.REACT_APP_BFF_HOST || 'localhost:3001';
  this.bffUrl = `${protocol}://${host}`;
}
```

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Roles Definition

```javascript
// bff/src/config/roles.ts
export const ROLES = {
  CUSTOMER: 'Customer',
  SUPPLIER: 'Supplier',
  DATA_STEWARD: 'Data Steward'
};

export const ROLE_PERMISSIONS = {
  'Customer': {
    canBrowseProducts: true,
    canAddCart: true,
    canCreateOrder: true,
    canViewOwnOrders: true,
    canAddProducts: false,
    canApproveProducts: false,
    canManageUsers: false,
  },
  'Supplier': {
    canBrowseProducts: true,
    canAddCart: false,
    canCreateOrder: false,
    canViewOwnOrders: false,
    canAddProducts: true,
    canApproveProducts: false,
    canManageUsers: false,
  },
  'Data Steward': {
    canBrowseProducts: true,
    canAddCart: false,
    canCreateOrder: false,
    canViewOwnOrders: false,
    canAddProducts: false,
    canApproveProducts: true,
    canManageUsers: true,
  }
};
```

### 3.2 BFF Authorization Middleware

```typescript
// bff/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
  };
  accessToken?: string;
}

/**
 * Verify JWT token and extract user info
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    const secret = process.env.JWT_SECRET || 'local-development-secret';

    // Verify token
    const decoded = jwt.verify(token, secret) as any;
    
    // Attach user info to request
    req.user = {
      sub: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };
    req.accessToken = token;

    next();
  } catch (error: any) {
    console.error('Auth validation error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        details: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token validation failed'
      });
    }

    res.status(401).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
};

/**
 * Check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        details: `Required role: ${allowedRoles.join(' or ')}`,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Log authenticated requests for debugging
 */
export const auditLog = (req: AuthRequest, res: Response, next: NextFunction) => {
  const original = res.json;
  
  res.json = function(data: any) {
    console.log(`[AUDIT] ${req.method} ${req.path}`);
    console.log(`  User: ${req.user?.username} (${req.user?.role})`);
    console.log(`  Status: ${res.statusCode}`);
    return original.call(this, data);
  };

  next();
};
```

### 3.3 Protected Endpoints in BFF

```typescript
// bff/src/routes/products.ts
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/products
 * Anyone authenticated can browse products
 */
router.get('/', authMiddleware, async (req, res) => {
  // Forward to Product Service
  // All authenticated users have access
});

/**
 * POST /api/products
 * Only suppliers can add products
 */
router.post('/', 
  authMiddleware, 
  requireRole(['Supplier']), 
  async (req, res) => {
    // Only suppliers reach here
  }
);

/**
 * PUT /api/products/:id/approve
 * Only Data Stewards can approve products
 */
router.put('/:id/approve',
  authMiddleware,
  requireRole(['Data Steward']),
  async (req, res) => {
    // Only Data Stewards reach here
  }
);
```

### 3.4 Frontend RBAC Implementation

```typescript
// frontend/src/components/ProtectedComponent.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';

interface ProtectedComponentProps {
  requiredRole?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  requiredRole,
  children,
  fallback = <div>Access denied</div>
}) => {
  const userRole = useSelector(selectUserRole);

  // No role requirement?
  if (!requiredRole) {
    return <>{children}</>;
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasAccess = userRole && allowedRoles.includes(userRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Usage
export const AdminButton = () => (
  <ProtectedComponent requiredRole="Data Steward">
    <button onClick={() => navigate('/admin')}>Admin Panel</button>
  </ProtectedComponent>
);
```

---

## 4. Data Flow Validation

### 4.1 Request Validation at Each Layer

```
Frontend → BFF → Microservice → Database
   ↓        ↓         ↓            ↓
  None     Check    Check        Check
           input    token &      query
           format   role         params
           & auth   & input
```

### 4.2 Frontend Validation (frontend/src/services/validation.ts)

```typescript
export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'array';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export class DataValidator {
  /**
   * Validate request data before sending to BFF
   */
  static validateRequest(data: any, rules: ValidationRule[]): {
    valid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required
      if (rule.required && !value) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      if (!value) continue; // Skip if not required and empty

      // Type checking
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[rule.field] = 'Invalid email format';
        }
      }

      // Min/Max
      if (rule.type === 'string' && rule.max && value.length > rule.max) {
        errors[rule.field] = `Max length is ${rule.max}`;
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[rule.field] = 'Invalid format';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Usage
const productValidationRules: ValidationRule[] = [
  { field: 'name', type: 'string', required: true, max: 255 },
  { field: 'price', type: 'number', required: true },
  { field: 'description', type: 'string', max: 1000 }
];

const { valid, errors } = DataValidator.validateRequest(formData, productValidationRules);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### 4.3 BFF Input Validation (bff/src/middleware/validation.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validate incoming request body
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// Schema definitions
export const schemas = {
  loginRequest: z.object({
    username: z.string().min(1).max(50),
    role: z.enum(['Customer', 'Supplier', 'Data Steward'])
  }),
  
  createProduct: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000),
    price: z.number().positive()
  }),
  
  createOrder: z.object({
    items: z.array(z.object({
      productId: z.number().positive(),
      quantity: z.number().positive().int()
    }))
  })
};

// Usage in routes
router.post('/products',
  authMiddleware,
  requireRole(['Supplier']),
  validateRequest(schemas.createProduct),
  async (req, res) => {
    // req.body is now validated
  }
);
```

### 4.4 Data Consistency Checks

```typescript
// bff/src/middleware/dataConsistency.ts

/**
 * Verify response from microservice is valid
 */
export const validateMicroserviceResponse = (response: any, expectedSchema: any) => {
  try {
    // Check required fields
    for (const field of expectedSchema.requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Type checking
    for (const [field, type] of Object.entries(expectedSchema.types)) {
      if (typeof response[field] !== type) {
        throw new Error(`Field ${field} has wrong type. Expected ${type}, got ${typeof response[field]}`);
      }
    }

    return { valid: true, errors: [] };
  } catch (error: any) {
    return { valid: false, errors: [error.message] };
  }
};

// Usage
const productSchema = {
  requiredFields: ['id', 'name', 'price'],
  types: {
    id: 'number',
    name: 'string',
    price: 'number',
    status: 'string'
  }
};

const response = await productService.getProduct(id);
const { valid, errors } = validateMicroserviceResponse(response, productSchema);
if (!valid) {
  console.error('Response validation failed:', errors);
}
```

---

## 5. Common Integration Issues & Solutions

### Issue 1: CORS Errors

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:3001/api/...' 
from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Root Cause:**
BFF CORS configuration doesn't include frontend origin.

**Solution:**
```typescript
// bff/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,  // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400  // Cache preflight for 24 hours
}));
```

### Issue 2: 401 Unauthorized Errors

**Symptom:**
```
POST /api/products → 401 Unauthorized
Frontend can login but all API calls fail
```

**Root Causes & Solutions:**

```typescript
// Problem 1: Token not being sent
// Solution: Check frontend is adding Authorization header
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BFF_URL
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Problem 2: Token expired
// Solution: Implement token refresh
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  
  const response = await axios.post(`${BFF_URL}/auth/refresh`, {
    refresh_token: refreshToken
  });
  
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.access_token;
};

// Problem 3: JWT secret mismatch
// Solution: Verify JWT_SECRET is same in BFF and when generating token
// BFF .env:  JWT_SECRET=your-secret-key
// Make sure same secret is used everywhere
```

### Issue 3: 403 Forbidden (Insufficient Permissions)

**Symptom:**
```
PUT /api/products/123/approve → 403 Forbidden
Required role: Data Steward
```

**Solution:**

```typescript
// Check user role in frontend before showing buttons
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';

export const ApproveProductButton = ({ productId }: { productId: number }) => {
  const userRole = useSelector(selectUserRole);
  
  // Only show button for Data Stewards
  if (userRole !== 'Data Steward') {
    return null;
  }
  
  return <button onClick={() => approveProduct(productId)}>Approve</button>;
};

// If user somehow tries to call endpoint without permission:
// 1. Check role before sending request
// 2. Handle 403 error response gracefully
// 3. Log attempt for security audit
```

### Issue 4: 503 Service Unavailable

**Symptom:**
```
GET /api/products → 503 Service Unavailable
Cannot reach backend microservice
```

**Solution:**

```typescript
// bff/src/services/serviceClient.ts
import axios from 'axios';

export const createServiceClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000'),
    validateStatus: (status) => status < 500 // Don't throw on 4xx
  });
};

// Handle service unavailability
try {
  const response = await productServiceClient.get('/api/products');
  if (response.status === 503) {
    return res.status(503).json({
      error: 'Product service unavailable',
      details: 'Please try again in a few minutes'
    });
  }
} catch (error: any) {
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service unavailable',
      details: 'Backend service is not running'
    });
  }
  throw error;
}

// Implement health checks
app.get('/health', async (req, res) => {
  const services = {
    userService: await checkService(USER_SERVICE_URL),
    productService: await checkService(PRODUCT_SERVICE_URL),
    orderService: await checkService(ORDER_SERVICE_URL),
    supplyService: await checkService(SUPPLY_SERVICE_URL)
  };
  
  const allHealthy = Object.values(services).every(s => s.healthy);
  res.status(allHealthy ? 200 : 503).json(services);
});

async function checkService(url: string) {
  try {
    await axios.get(`${url}/health`, { timeout: 5000 });
    return { healthy: true, latency: 0 };
  } catch {
    return { healthy: false, latency: -1 };
  }
}
```

### Issue 5: Gateway Timeout (504)

**Symptom:**
```
POST /api/orders → 504 Gateway Timeout
Request took longer than 30 seconds
```

**Solution:**

```typescript
// Increase timeout for long-running operations
const orderServiceClient = axios.create({
  baseURL: process.env.ORDER_SERVICE_URL,
  timeout: 60000  // 60 seconds for order creation
});

// Or implement async processing
router.post('/api/orders/async',
  authMiddleware,
  requireRole(['Customer']),
  async (req, res) => {
    // Return immediately with job ID
    const jobId = generateId();
    res.json({ status: 'processing', jobId });
    
    // Process in background
    processOrderAsync(jobId, req.body).catch(err => 
      console.error(`Order ${jobId} processing failed:`, err)
    );
  }
);

// Check status later
router.get('/api/orders/status/:jobId', 
  authMiddleware,
  async (req, res) => {
    const status = await getJobStatus(req.params.jobId);
    res.json(status);
  }
);
```

### Issue 6: Data Inconsistency

**Symptom:**
```
- Frontend shows cart with 3 items
- Backend shows 0 items
- Order creation fails unexpectedly
```

**Solution:**

```typescript
// Implement state reconciliation
export const reconcileCartState = async () => {
  // Get cart state from frontend Redux
  const reduxCart = store.getState().cart.items;
  
  // Get actual cart from backend
  const backendCart = await apiService.get('/api/cart');
  
  // Compare and sync
  if (JSON.stringify(reduxCart) !== JSON.stringify(backendCart.items)) {
    console.warn('Cart state mismatch, using backend as source of truth');
    store.dispatch(setCartItems(backendCart.items));
  }
};

// Call on app startup and after critical operations
useEffect(() => {
  reconcileCartState();
}, []);

// Transaction wrapper for multi-step operations
export const executeTransaction = async (steps: Array<() => Promise<any>>) => {
  const results = [];
  const rollbacks: Array<() => Promise<any>> = [];
  
  try {
    for (const step of steps) {
      const result = await step();
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    // Rollback on failure
    for (const rollback of rollbacks.reverse()) {
      await rollback().catch(console.error);
    }
    throw error;
  }
};
```

---

## 6. Debugging Tools & Techniques

### 6.1 Enable Debug Logging

```typescript
// frontend/.env
REACT_APP_DEBUG=true

// frontend/src/services/logger.ts
export class Logger {
  static debug(message: string, data?: any) {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  static trace(message: string, stack?: any) {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.trace(`[TRACE] ${message}`, stack);
    }
  }
}
```

### 6.2 BFF Request/Response Logging

```typescript
// bff/src/middleware/logger.ts
import morgan from 'morgan';

// Detailed logging for debugging
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" ' +
  ':status :res[content-length] ":referrer" ":user-agent" response-time: :response-time ms'
));

// Log all requests and responses
app.use((req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`  User: ${req.user?.username || 'anonymous'}`);
    console.log(`  Role: ${req.user?.role || 'none'}`);
    console.log(`  Status: ${this.statusCode}`);
    console.log(`  Duration: ${duration}ms`);
    
    return originalJson.call(this, data);
  };
  
  next();
});
```

### 6.3 Network Inspection in Browser

```typescript
// Add request/response interceptors for inspection
// frontend/src/services/apiService.ts

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BFF_URL
});

axiosInstance.interceptors.request.use(
  config => {
    console.log('%cRequest', 'color: blue; font-weight: bold;');
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => {
    console.log('%cResponse', 'color: green; font-weight: bold;');
    console.log(`${response.status} ${response.statusText}`);
    console.log('Data:', response.data);
    return response;
  },
  error => {
    console.log('%cError', 'color: red; font-weight: bold;');
    console.log(`Status: ${error.response?.status}`);
    console.log('Data:', error.response?.data);
    return Promise.reject(error);
  }
);
```

### 6.4 JWT Token Inspection

```typescript
// Debug JWT tokens
export const inspectToken = (token: string) => {
  try {
    const [header, payload, signature] = token.split('.');
    
    const decodedHeader = JSON.parse(atob(header));
    const decodedPayload = JSON.parse(atob(payload));
    
    console.log('Token Header:', decodedHeader);
    console.log('Token Payload:', decodedPayload);
    console.log('Token Valid:', isTokenValid(decodedPayload));
    
    return { header: decodedHeader, payload: decodedPayload };
  } catch (error) {
    console.error('Failed to parse token:', error);
  }
};

const isTokenValid = (payload: any) => {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
};

// Usage: inspectToken(localStorage.getItem('access_token')!)
```

### 6.5 API Testing Tools

**Postman Collection Template:**

```json
{
  "info": { "name": "eCommerce API Integration Tests" },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/auth/login",
        "body": {
          "raw": "{\n  \"username\": \"customer1\",\n  \"role\": \"Customer\"\n}"
        }
      }
    },
    {
      "name": "Get Products",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/products",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ]
      }
    }
  ]
}
```

**cURL Examples:**

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","role":"Customer"}'

# Get products (with token from login response)
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer <access_token_from_login>"

# Create product (supplier only)
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <supplier_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 29.99,
    "description": "Test"
  }'

# Approve product (data steward only)
curl -X PUT http://localhost:3001/api/products/1/approve \
  -H "Authorization: Bearer <steward_token>"
```

---

## 7. Testing Integration

### 7.1 Integration Test Suite

```typescript
// tests/integration/e2e.test.ts
import axios from 'axios';

const BFF_URL = 'http://localhost:3001';
const client = axios.create({ baseURL: BFF_URL });

describe('End-to-End Integration Tests', () => {
  let customerToken: string;
  let supplierToken: string;
  let stewardToken: string;

  // Setup: Login all users
  beforeAll(async () => {
    const customerRes = await client.post('/api/auth/login', {
      username: 'customer1',
      role: 'Customer'
    });
    customerToken = customerRes.data.access_token;

    const supplierRes = await client.post('/api/auth/login', {
      username: 'supplier1',
      role: 'Supplier'
    });
    supplierToken = supplierRes.data.access_token;

    const stewardRes = await client.post('/api/auth/login', {
      username: 'steward1',
      role: 'Data Steward'
    });
    stewardToken = stewardRes.data.access_token;
  });

  test('Customer can browse products', async () => {
    const response = await client.get('/api/products', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Supplier can add product', async () => {
    const response = await client.post('/api/products', {
      name: 'Test Product',
      price: 29.99,
      description: 'Test'
    }, {
      headers: { Authorization: `Bearer ${supplierToken}` }
    });
    
    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
  });

  test('Customer cannot add product', async () => {
    const response = await client.post('/api/products', {
      name: 'Test Product',
      price: 29.99
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).catch(err => err.response);
    
    expect(response.status).toBe(403);
  });

  test('Data Steward can approve products', async () => {
    // First, create a product as supplier
    const createRes = await client.post('/api/products', {
      name: 'To Approve',
      price: 39.99
    }, {
      headers: { Authorization: `Bearer ${supplierToken}` }
    });
    
    const productId = createRes.data.id;
    
    // Then approve as steward
    const approveRes = await client.put(
      `/api/products/${productId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${stewardToken}` } }
    );
    
    expect(approveRes.status).toBe(200);
  });

  test('Invalid token returns 401', async () => {
    const response = await client.get('/api/products', {
      headers: { Authorization: 'Bearer invalid-token' }
    }).catch(err => err.response);
    
    expect(response.status).toBe(401);
  });

  test('Missing token returns 401', async () => {
    const response = await client.get('/api/products')
      .catch(err => err.response);
    
    expect(response.status).toBe(401);
  });
});
```

### 7.2 Manual Testing Checklist

```markdown
# Integration Testing Checklist

## Authentication Flow
- [ ] User can login with correct credentials
- [ ] Login returns access_token, id_token, refresh_token
- [ ] Invalid credentials return 401
- [ ] Token stored in localStorage
- [ ] Token included in subsequent requests

## Authorization by Role
- [ ] Customer can access customer endpoints
- [ ] Customer cannot access supplier endpoints (403)
- [ ] Supplier can add products
- [ ] Data Steward can approve products
- [ ] Data Steward cannot create orders

## Data Flow
- [ ] Product created by supplier appears in list
- [ ] Product in pending state after creation
- [ ] Product approved by steward becomes visible
- [ ] Cart items persist across page reloads
- [ ] Order created from cart clears cart

## Error Handling
- [ ] Network errors show user-friendly message
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission denied
- [ ] 500 errors show "try again" message
- [ ] Timeouts handled gracefully

## Security
- [ ] Sensitive data not logged in frontend
- [ ] Tokens not exposed in URLs
- [ ] HTTPS used in production
- [ ] CORS headers correct
```

---

## 8. Monitoring & Maintenance

### 8.1 Health Checks

```typescript
// Implement regular health checks
export const startHealthChecks = () => {
  setInterval(async () => {
    const services = {
      userService: await checkService(USER_SERVICE_URL),
      productService: await checkService(PRODUCT_SERVICE_URL),
      orderService: await checkService(ORDER_SERVICE_URL),
      supplyService: await checkService(SUPPLY_SERVICE_URL)
    };
    
    const down = Object.entries(services)
      .filter(([_, status]) => !status.healthy)
      .map(([name]) => name);
    
    if (down.length > 0) {
      console.error(`🚨 Services down: ${down.join(', ')}`);
      // Send alert to monitoring system
    }
  }, 60000); // Check every 60 seconds
};
```

### 8.2 Performance Monitoring

```typescript
// Track response times
export const monitorPerformance = () => {
  const metrics = {
    requests: 0,
    totalTime: 0,
    errors: 0,
    avgTime: 0
  };
  
  app.use((req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalJson = res.json;
    
    res.json = function(data: any) {
      const duration = Date.now() - startTime;
      metrics.requests++;
      metrics.totalTime += duration;
      metrics.avgTime = metrics.totalTime / metrics.requests;
      
      if (res.statusCode >= 400) metrics.errors++;
      
      return originalJson.call(this, data);
    };
    
    next();
  });
  
  // Report metrics
  setInterval(() => {
    console.log('Performance Metrics:', metrics);
  }, 300000); // Every 5 minutes
};
```

---

**This comprehensive guide covers secure integration across all three layers with specific debugging strategies and common issue resolution.**

