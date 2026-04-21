# BFF Quick Start Guide

## Installation

### Step 1: Install Dependencies

```bash
cd backend/bff
npm install
```

**Dependencies installed:**
- `express` - Web framework
- `axios` - HTTP client for proxying requests
- `jsonwebtoken` - JWT token generation & verification
- `cors` - CORS middleware
- `morgan` - Request logging
- `body-parser` - JSON parsing

### Step 2: Configure Environment (Optional)

The BFF uses sensible defaults. To customize:

```bash
# Copy example file
cp .env.example .env

# Edit .env for custom configuration
# (Only needed if ports are different)
```

Default configuration:
- Port: `3001`
- JWT Secret: `your-secret-key-change-in-production`
- Frontend CORS: `http://localhost:3000`
- Microservices: `localhost:8081-8084`

## Running the BFF

### Development Mode (with auto-restart)

```bash
npm run dev
```

Requires `nodemon` to be installed (included in devDependencies).

### Production Mode

```bash
npm start
```

## Verify BFF is Running

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2026-04-16T12:00:00Z",
#   "services": {
#     "userService": "http://localhost:8081",
#     "productService": "http://localhost:8082",
#     "orderService": "http://localhost:8083",
#     "supplierService": "http://localhost:8084"
#   }
# }
```

## Test Login

```bash
# Login as customer
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "password": "pass123"
  }'

# Response includes JWT token
```

## Save Token for Testing

```bash
# Get token from login response
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

# Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
```

## Common Tasks

### List All Users (requires DATA_STEWARD)

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"pass123"}' | jq -r '.accessToken')

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/users
```

### Create a Product (requires SUPPLIER)

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"supplier1","password":"pass123"}' | jq -r '.accessToken')

curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro 15",
    "description": "High-performance laptop",
    "category": "Electronics",
    "price": 999.99,
    "stock": 50
  }'
```

### Create an Order (requires CUSTOMER)

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1}'
```

## Troubleshooting

### "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

### "Port 3001 already in use"

**Solution 1: Change port**
```bash
# Edit .env
PORT=3002
npm start
```

**Solution 2: Kill existing process**
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### "Service Unavailable: User Service is not responding"

**Solution:** Make sure microservices are running on ports 8081-8084

```bash
# Check if User Service is running
curl http://localhost:8081/api/users

# If not, start the microservices (use Maven)
cd backend/user-service
mvn spring-boot:run
```

### "Invalid or expired token"

**Solution:** Generate new token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}'
```

## Full System Startup Sequence

To run the complete eCommerce platform:

### Terminal 1: Start BFF
```bash
cd backend/bff
npm install  # one time only
npm start
# Output: ✓ BFF Server running on port 3001
```

### Terminal 2: Start User Service
```bash
cd backend/user-service
mvn spring-boot:run
# Output: Started UserServiceApplication in X seconds
```

### Terminal 3: Start Product Service
```bash
cd backend/product-service
mvn spring-boot:run
# Output: Started ProductServiceApplication in X seconds
```

### Terminal 4: Start Order Service
```bash
cd backend/order-service
mvn spring-boot:run
# Output: Started OrderServiceApplication in X seconds
```

### Terminal 5: Start Supply Management Service
```bash
cd backend/supply-management-service
mvn spring-boot:run
# Output: Started SupplyManagementServiceApplication in X seconds
```

### Terminal 6: Start Frontend
```bash
cd frontend
npm install  # one time only
npm start
# Output: Webpack compiled successfully, app available at http://localhost:3000
```

Once all are running, the system is ready for testing!

## File Structure

```
backend/bff/
├── src/
│   ├── index.js              # Main Express server
│   ├── config.js             # Configuration (ports, JWT, services)
│   ├── middleware/
│   │   └── auth.js           # JWT verification & role checking
│   ├── routes/
│   │   ├── authController.js # Login, getCurrentUser, getRoles
│   │   └── proxy.js          # All proxy routes to microservices
│   └── utils/
│       ├── errorHandler.js   # Centralized error handling
│       ├── jwtHelper.js      # JWT token generation & validation
│       └── httpClient.js     # HTTP client for microservice calls
├── .env.example              # Example environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start BFF: `npm start`
3. ✅ Verify health: `curl http://localhost:3001/health`
4. ✅ Test login: See "Test Login" section above
5. ✅ Start microservices (if not already running)
6. ✅ Test endpoint: `curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products`

---

**Status:** BFF is production-ready. Can handle multiple concurrent requests with proper error handling and role-based authorization.
