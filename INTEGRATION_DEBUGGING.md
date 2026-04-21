# Integration Debugging Handbook

Comprehensive guide to diagnosing and resolving integration issues across all three layers.

---

## Table of Contents
1. Debugging Setup
2. Request/Response Tracing
3. Common Issues & Solutions
4. Layer-by-Layer Debugging
5. Security & Authentication Issues
6. Performance & Timeout Issues
7. Data Consistency Issues
8. Advanced Debugging Techniques

---

## 1. Debugging Setup

### 1.1 Enable Debug Logging in All Layers

**Frontend Debug Mode:**

```env
# frontend/.env
REACT_APP_DEBUG=true
REACT_APP_ENABLE_LOGGING=true
REACT_APP_LOG_LEVEL=debug
```

```typescript
// frontend/src/utils/logger.ts
export class Logger {
  static debug(message: string, data?: any) {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`%c[${new Date().toISOString()}] DEBUG`, 'color: blue; font-weight: bold;', message, data);
    }
  }

  static error(message: string, error?: any) {
    console.error(`%c[${new Date().toISOString()}] ERROR`, 'color: red; font-weight: bold;', message, error);
  }

  static warn(message: string, data?: any) {
    console.warn(`%c[${new Date().toISOString()}] WARN`, 'color: orange; font-weight: bold;', message, data);
  }

  static info(message: string, data?: any) {
    console.log(`%c[${new Date().toISOString()}] INFO`, 'color: green; font-weight: bold;', message, data);
  }
}
```

**BFF Debug Mode:**

```env
# bff/.env
LOG_LEVEL=debug
DEBUG=*
```

```typescript
// bff/src/utils/logger.ts
import debug from 'debug';

export const createLogger = (namespace: string) => {
  const dbg = debug(namespace);
  
  return {
    debug: (message: string, data?: any) => dbg(`[DEBUG] ${message}`, data),
    info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
    warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
    error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error)
  };
};

// Usage
const logger = createLogger('bff:routes:products');
logger.debug('Getting products', { userId: req.user.id });
```

**Backend Debug Mode:**

```properties
# application.properties
logging.level.root=INFO
logging.level.com.ecommerce=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

### 1.2 Request/Response Interceptors

**Frontend Axios Interceptor:**

```typescript
// frontend/src/services/apiService.ts
axiosInstance.interceptors.request.use(
  config => {
    const requestInfo = {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      timestamp: new Date().toISOString(),
      token: config.headers.Authorization?.substring(0, 20) + '...'
    };

    console.group(`%c→ REQUEST`, `color: blue; font-weight: bold;`);
    console.table(requestInfo);
    if (config.data) console.log('Body:', config.data);
    console.groupEnd();

    return config;
  },
  error => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    const responseInfo = {
      status: response.status,
      statusText: response.statusText,
      duration: response.duration,
      timestamp: new Date().toISOString()
    };

    console.group(`%c← RESPONSE`, `color: green; font-weight: bold;`);
    console.table(responseInfo);
    console.log('Data:', response.data);
    console.groupEnd();

    return response;
  },
  error => {
    const errorInfo = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      timestamp: new Date().toISOString()
    };

    console.group(`%c✗ ERROR`, `color: red; font-weight: bold;`);
    console.table(errorInfo);
    console.log('Error Data:', error.response?.data);
    console.log('Error Message:', error.message);
    console.groupEnd();

    return Promise.reject(error);
  }
);
```

---

## 2. Request/Response Tracing

### 2.1 Trace a Login Request

**Step 1: Frontend makes login request**

Open browser DevTools (F12), go to Console:

```javascript
// Check what we're sending
console.log('Login payload:', {
  username: 'customer1',
  role: 'Customer'
});

// Make the request
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'customer1', role: 'Customer' })
})
  .then(r => r.json())
  .then(data => {
    console.log('Login response:', data);
    console.log('Token structure:', {
      accessToken: data.access_token?.substring(0, 20) + '...',
      idToken: data.id_token?.substring(0, 20) + '...',
      expiresIn: data.expires_in
    });
  })
  .catch(err => console.error('Login failed:', err));
```

**Step 2: Check BFF logs**

Terminal running BFF:

```
[2026-04-19] POST /api/auth/login
  Status: 200
  Duration: 12ms
```

**Step 3: Verify token storage**

In frontend console:

```javascript
// Check stored tokens
console.log('Tokens in localStorage:');
console.log('access_token:', localStorage.getItem('access_token')?.substring(0, 30) + '...');
console.log('id_token:', localStorage.getItem('id_token')?.substring(0, 30) + '...');
console.log('refresh_token:', localStorage.getItem('refresh_token')?.substring(0, 30) + '...');

// Decode and inspect token
function inspectToken(token) {
  const [header, payload, sig] = token.split('.');
  return {
    header: JSON.parse(atob(header)),
    payload: JSON.parse(atob(payload)),
    signature: sig.substring(0, 20) + '...'
  };
}

const idToken = localStorage.getItem('id_token');
console.log('ID Token decoded:', inspectToken(idToken));
```

### 2.2 Trace an API Request with Authentication

**Frontend Console:**

```javascript
// Manually trace a product listing request
const token = localStorage.getItem('access_token');

fetch('http://localhost:3001/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Request-ID': 'debug-trace-' + Date.now()
  }
})
  .then(r => {
    console.log('Response status:', r.status);
    console.log('Response headers:', {
      'content-type': r.headers.get('content-type'),
      'x-request-id': r.headers.get('x-request-id')
    });
    return r.json();
  })
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Failed:', err));
```

**BFF Console:**

```
[DEBUG] POST /api/auth/login │
  User: customer1 (Customer) │
  Status: 200
  Duration: 8ms

[DEBUG] GET /api/products
  User: customer1 (Customer)
  Token valid: true
  Token expires: 3600s
  Status: 200
  Duration: 45ms
    → Product Service latency: 35ms
```

**Browser Network Tab (F12 → Network):**

1. Click on request to `/api/products`
2. Check Headers:
   - Request Headers: `Authorization: Bearer <token>`
   - Response Headers: `X-Request-ID: ...`
3. Check Response: `{products: [...]}` or error
4. Check Timing: Total time breakdown

---

## 3. Common Issues & Solutions

### Issue A: CORS Error on Login

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:3001/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Debug Steps:**

```javascript
// 1. Check if BFF is running
console.log('Checking BFF health...');
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(data => console.log('BFF status:', data))
  .catch(err => console.error('BFF unreachable:', err));

// 2. Check CORS headers with manual fetch
fetch('http://localhost:3001/api/auth/login', {
  method: 'OPTIONS' // Preflight request
})
  .then(r => {
    console.log('CORS headers:');
    console.log('Access-Control-Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', r.headers.get('Access-Control-Allow-Methods'));
    console.log('Access-Control-Allow-Headers:', r.headers.get('Access-Control-Allow-Headers'));
  });
```

**Solution:**

```typescript
// bff/src/server.ts
app.use(cors({
  origin: 'http://localhost:3000',  // Whitelist frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
```

### Issue B: 401 Unauthorized on Protected Endpoint

**Symptom:**
```
POST /api/products → 401 Unauthorized
```

**Debug Steps 1 - Check Token:**

```javascript
// Frontend console
const token = localStorage.getItem('access_token');

if (!token) {
  console.error('❌ No token in localStorage!');
  console.log('Login first');
} else {
  // Decode token
  const [header, payload, sig] = token.split('.');
  const decoded = JSON.parse(atob(payload));
  
  console.log('Token payload:', decoded);
  console.log('Token expires at:', new Date(decoded.exp * 1000));
  console.log('Token is valid:', decoded.exp > Math.floor(Date.now() / 1000));
  
  if (!localStorage.getItem('id_token')) {
    console.error('⚠️  No ID token!');
  }
}
```

**Debug Steps 2 - Check Authorization Header:**

```javascript
// Make request and inspect Authorization header
const token = localStorage.getItem('access_token');
console.log('Authorization header:', `Bearer ${token?.substring(0, 30)}...`);

fetch('http://localhost:3001/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => {
    console.log('Response status:', r.status);
    return r.json();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

**Debug Steps 3 - Check BFF JWT Validation:**

```typescript
// bff/src/middleware/authMiddleware.ts
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Checking authorization...');
    console.log('[AUTH] Header:', authHeader?.substring(0, 30) + '...');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] ❌ Invalid authorization header format');
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    
    console.log('[AUTH] Verifying token with secret:', secret?.substring(0, 10) + '...');
    const decoded = jwt.verify(token, secret);
    
    console.log('[AUTH] ✓ Token valid, user:', decoded.username);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log('[AUTH] ❌ Token validation failed:', error.message);
    res.status(401).json({ error: error.message });
  }
};
```

**Solution Checklist:**
- [ ] JWT_SECRET is same in BFF and backend
- [ ] Token is being sent in Authorization header
- [ ] Token format is: `Bearer <token>`
- [ ] Token hasn't expired
- [ ] Server clocks are synchronized

### Issue C: 403 Forbidden (Role Check Failure)

**Symptom:**
```
PUT /api/products/1/approve → 403 Forbidden
Required role: Data Steward
```

**Debug Steps:**

```javascript
// Frontend console - check current user role
const idToken = localStorage.getItem('id_token');
const [_, payload] = idToken.split('.');
const decoded = JSON.parse(atob(payload));

console.log('Current user role:', decoded.role);

// Manually try request
const token = localStorage.getItem('access_token');
fetch('http://localhost:3001/api/products/1/approve', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.error('Access denied:', data.error);
    } else {
      console.log('Success:', data);
    }
  });
```

**Debug BFF Role Check:**

```typescript
// bff/src/middleware/authMiddleware.ts
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('[RBAC] Checking role requirement...');
    console.log('[RBAC] Allowed roles:', allowedRoles);
    console.log('[RBAC] User role:', req.user?.role);
    
    if (!req.user) {
      console.log('[RBAC] ❌ No user info in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    
    if (!hasRole) {
      console.log('[RBAC] ❌ User does not have required role');
      return res.status(403).json({
        error: 'Access denied',
        required: allowedRoles,
        actual: req.user.role
      });
    }

    console.log('[RBAC] ✓ User has required role');
    next();
  };
};
```

**Solution:**
- [ ] User logged in with correct role
- [ ] Token contains correct role claim
- [ ] Endpoint is protected with correct role
- [ ] Frontend not showing button for unauthorized roles

### Issue D: 504 Gateway Timeout

**Symptom:**
```
Request hanging for 30+ seconds, then 504 error
```

**Debug Steps:**

```javascript
// Time the request
console.time('product-request');
fetch('http://localhost:3001/api/products')
  .then(r => r.json())
  .then(data => console.timeEnd('product-request'))
  .catch(err => {
    console.timeEnd('product-request');
    console.error('Error:', err);
  });
```

**Check Service Status:**

```bash
# In separate terminal, check if backend services are running
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health

# All should return: {"status":"ok"}
```

**Check BFF Logs for Service Calls:**

```typescript
// bff/src/services/serviceClient.ts
const productServiceClient = axios.create({
  baseURL: process.env.PRODUCT_SERVICE_URL,
  timeout: 30000
});

productServiceClient.interceptors.request.use(req => {
  console.log(`[SERVICE] → ${req.method?.toUpperCase()} ${req.url}`);
  return req;
});

productServiceClient.interceptors.response.use(
  res => {
    console.log(`[SERVICE] ← ${res.status} ${res.statusText}`);
    return res;
  },
  err => {
    console.error(`[SERVICE] ✗ ${err.code} ${err.message}`);
    return Promise.reject(err);
  }
);
```

---

## 4. Layer-by-Layer Debugging

### Frontend Layer

**Check Initialization:**

```javascript
// In browser console on app load
console.log('Frontend initialized');
console.log('BFF URL:', process.env.REACT_APP_BFF_URL);
console.log('Debug enabled:', process.env.REACT_APP_DEBUG);
console.log('Auth service:', window.__AUTH_SERVICE__);
```

**Check Redux State:**

```javascript
// In Redux DevTools or console
console.log('Auth state:', store.getState().auth);
console.log('Cart state:', store.getState().cart);
console.log('Products state:', store.getState().products);
```

### BFF Layer

**Health Check:**

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

**Check Service Connectivity:**

```bash
# Test connection to each microservice
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health
```

**Monitor Real-time Logs:**

```bash
# In BFF terminal running server
# Enable debug: DEBUG=* npm start
# Or: LOG_LEVEL=debug npm start
```

### Backend Layer

**Test Microservice Directly:**

```bash
# Test User Service
curl -H "Authorization: Bearer <valid_jwt_token>" \
  http://localhost:8081/api/users

# Test Product Service  
curl -H "Authorization: Bearer <valid_jwt_token>" \
  http://localhost:8082/api/products

# Test Health
curl http://localhost:8081/health
curl http://localhost:8082/health
```

---

## 5. Security & Authentication Issues

### JWT Token Problems

**Token Generation Issues:**

```typescript
// Debug JWT generation
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
console.log('JWT Secret:', secret?.substring(0, 10) + '...');

const payload = {
  sub: 'customer1',
  username: 'customer1',
  role: 'Customer'
};

try {
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  console.log('Generated token:', token);
  
  const verified = jwt.verify(token, secret);
  console.log('Token verified:', verified);
} catch (error) {
  console.error('Token operation failed:', error);
}
```

**Token Verification Issues:**

```javascript
// Check token expiration
const token = localStorage.getItem('access_token');
const [_, payload] = token.split('.');
const decoded = JSON.parse(atob(payload));

const now = Math.floor(Date.now() / 1000);
const expiresIn = decoded.exp - now;

console.log(`Token expires in ${expiresIn}s (${Math.round(expiresIn/60)}m)`);
console.log('Is expired:', expiresIn < 0);
```

---

## 6. Performance & Timeout Issues

### Identify Slow Endpoints

**Add timing to BFF:**

```typescript
// bff/src/middleware/timing.ts
export const timingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
    console.log(`[TIMING] ${req.method} ${req.path} - ${duration}ms`);
    return originalJson.call(this, data);
  };
  
  next();
};

app.use(timingMiddleware);
```

**Analyze from browser:**

```javascript
// Check response times
fetch('http://localhost:3001/api/products')
  .then(r => {
    const time = r.headers.get('X-Response-Time');
    console.log('Response time:', time);
  });
```

---

## 7. Data Consistency Issues

### Validate Response Structure

```typescript
// Frontend - validate response before using
function validateProductResponse(data: any) {
  const required = ['id', 'name', 'price'];
  const missing = required.filter(field => !(field in data));
  
  if (missing.length > 0) {
    console.error('Invalid response structure, missing:', missing);
    return false;
  }
  
  return true;
}
```

---

## 8. Advanced Debugging Techniques

### Request Replay

```bash
# Save a curl request, then replay with different params
curl -v -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug Product",
    "price": 29.99,
    "description": "Testing"
  }' > request-response.txt

# Review response
cat request-response.txt
```

### Network Capture

```bash
# Capture all traffic (requires packet sniffer)
tcpdump -i lo -A host localhost and port 3001

# Or use Wireshark GUI for better visualization
```

---

**Use this handbook systematically to debug any integration issue step-by-step.**

