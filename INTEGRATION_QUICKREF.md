# Integration Quick Reference & Validation Checklist

Fast lookup and validation guide for end-to-end integration.

---

## Quick Reference

### Common Commands

```bash
# Start all services
./run-all-services.bat                    # Windows

# Start individual services
cd frontend && npm start                  # Terminal 1
cd bff && npm start                       # Terminal 2
cd backend/user-service && mvn spring-boot:run    # Terminal 3 (repeat for others)

# Test endpoints
curl http://localhost:3001/health         # BFF health
curl http://localhost:8081/health         # User Service health

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","role":"Customer"}' | jq -r '.access_token')

# Use token in request
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products
```

### Port Quick Reference

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React application |
| BFF | 3001 | API gateway |
| User Service | 8081 | User management |
| Product Service | 8082 | Product catalog |
| Order Service | 8083 | Order processing |
| Supply Service | 8084 | Supplier management |

### Key Files

| File | Purpose | Location |
|------|---------|----------|
| .env | Environment variables | `frontend/.env`, `bff/.env` |
| apiService.ts | HTTP client | `frontend/src/services/` |
| authService.ts | Authentication | `frontend/src/services/` |
| authMiddleware.ts | JWT validation | `bff/src/middleware/` |
| SecurityConfig.java | Spring security | `backend/*/src/main/java/com/ecommerce/config/` |

### Test Users

```
Username: customer1      Password: (none needed)    Role: Customer
Username: customer2      Password: (none needed)    Role: Customer
Username: supplier1      Password: (none needed)    Role: Supplier
Username: supplier2      Password: (none needed)    Role: Supplier
Username: steward1       Password: (none needed)    Role: Data Steward
Username: steward2       Password: (none needed)    Role: Data Steward
```

### Token Inspection

```javascript
// In browser console
const token = localStorage.getItem('access_token');
const [h, p, s] = token.split('.');
console.log('Header:', JSON.parse(atob(h)));
console.log('Payload:', JSON.parse(atob(p)));
```

---

## Integration Validation Checklist

### Pre-Integration

- [ ] Frontend .env configured with BFF_URL
- [ ] BFF .env configured with service URLs and JWT_SECRET
- [ ] All backend services have application.properties
- [ ] All services can start without errors
- [ ] Node dependencies installed (`npm install` in frontend and bff)
- [ ] Maven dependencies resolved (run `mvn clean install`)

### Backend Services

- [ ] User Service running on port 8081
  - [ ] Health check: `curl http://localhost:8081/health`
  - [ ] H2 console accessible: `http://localhost:8081/h2-console`
  - [ ] Test user data loaded
  
- [ ] Product Service running on port 8082
  - [ ] Health check: `curl http://localhost:8082/health`
  - [ ] H2 console accessible: `http://localhost:8082/h2-console`
  
- [ ] Order Service running on port 8083
  - [ ] Health check: `curl http://localhost:8083/health`
  
- [ ] Supply Management Service running on port 8084
  - [ ] Health check: `curl http://localhost:8084/health`

### BFF Layer

- [ ] BFF listening on port 3001
  - [ ] Health check: `curl http://localhost:3001/health`
  - [ ] Response format: `{"status":"ok","timestamp":"...","uptime":...}`
  
- [ ] CORS enabled
  - [ ] `curl -i -X OPTIONS http://localhost:3001/api/products`
  - [ ] Check: `Access-Control-Allow-Origin: http://localhost:3000`
  
- [ ] Authentication endpoint working
  - [ ] `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"customer1","role":"Customer"}'`
  - [ ] Response includes: `access_token`, `id_token`, `refresh_token`
  
- [ ] Protected endpoints
  - [ ] Without token: `curl http://localhost:3001/api/products → 401`
  - [ ] With invalid token: `curl -H "Authorization: Bearer invalid" http://localhost:3001/api/products → 401`
  - [ ] With valid token: `curl -H "Authorization: Bearer <valid_token>" http://localhost:3001/api/products → 200`

### Frontend Layer

- [ ] Frontend accessible at http://localhost:3000
  - [ ] Opens without errors
  - [ ] Console shows no critical errors
  
- [ ] Login flow works
  - [ ] Can navigate to login page
  - [ ] Can select user and role
  - [ ] Submit triggers API call
  - [ ] Success redirects to dashboard
  
- [ ] Token storage
  - [ ] After login, check localStorage:
    - [ ] `localStorage.getItem('access_token')` returns valid JWT
    - [ ] `localStorage.getItem('id_token')` returns valid JWT
    - [ ] `localStorage.getItem('refresh_token')` exists
  
- [ ] Authenticated requests
  - [ ] Can call `/api/products` while logged in
  - [ ] Response shows product list
  - [ ] Authorization header contains token
  
- [ ] Role-based UI
  - [ ] Logged in as customer: see customer menu items
  - [ ] Logged in as supplier: see supplier menu items
  - [ ] Logged in as data steward: see admin menu items

### Data Flow

- [ ] Request tracing
  - [ ] Frontend → BFF: Request arrives with token
  - [ ] BFF validates: Token decoded successfully
  - [ ] BFF → Backend: Request forwarded with token
  - [ ] Backend validates: Token verified
  - [ ] Backend → DB: Query executes
  - [ ] Backend → BFF: Response returned
  - [ ] BFF → Frontend: Response forwarded
  - [ ] Frontend: Data displayed to user

- [ ] Cart functionality (Customer)
  - [ ] Can browse products
  - [ ] Can add to cart
  - [ ] Cart persists on page reload
  - [ ] Can view cart contents
  - [ ] Can remove items
  - [ ] Can checkout

- [ ] Product management (Supplier)
  - [ ] Can add new product
  - [ ] Product appears in pending state
  - [ ] Cannot approve own products
  - [ ] Can update product details

- [ ] Product approval (Data Steward)
  - [ ] Can see pending products
  - [ ] Can approve products
  - [ ] Can reject products
  - [ ] Approved products visible to customers

### Security

- [ ] Token validation
  - [ ] Expired token returns 401
  - [ ] Invalid token returns 401
  - [ ] Token refresh works
  
- [ ] Role-based access control
  - [ ] Customer cannot POST /api/products (403)
  - [ ] Supplier cannot PUT /api/products/{id}/approve (403)
  - [ ] Only Data Steward can approve (200)
  
- [ ] CORS
  - [ ] Frontend can access BFF
  - [ ] Cross-origin requests work
  - [ ] Cookies/auth headers included
  
- [ ] HTTPS (Production)
  - [ ] All traffic encrypted
  - [ ] Certificates valid
  - [ ] Mixed content warnings resolved

### Error Handling

- [ ] 401 Unauthorized
  - [ ] Missing token: `{"error":"Missing or invalid Authorization header"}`
  - [ ] Invalid token: `{"error":"Invalid token"}`
  - [ ] Expired token: `{"error":"Token expired"}`
  
- [ ] 403 Forbidden
  - [ ] Insufficient role: `{"error":"Access denied","required":["Data Steward"],"actual":"Customer"}`
  
- [ ] 404 Not Found
  - [ ] Non-existent endpoint: `{"error":"Not found"}`
  
- [ ] 500 Internal Server Error
  - [ ] Backend error: Returns error details
  - [ ] Clear error message
  
- [ ] Network Errors
  - [ ] Connection refused: Handled gracefully
  - [ ] Timeout: Error message shown
  - [ ] Service unavailable: User-friendly message

### Performance

- [ ] Response times acceptable (< 500ms)
  - [ ] GET /api/products: < 100ms
  - [ ] POST /api/products: < 200ms
  - [ ] PUT /api/products/{id}/approve: < 200ms
  
- [ ] No memory leaks
  - [ ] Frontend DevTools: Memory stable over time
  
- [ ] Backend scalability
  - [ ] Can handle 10+ concurrent requests
  - [ ] Database connections pooled
  - [ ] No connection exhaustion

### Monitoring

- [ ] Health endpoints functioning
  - [ ] Frontend: Can check app status
  - [ ] BFF: `/health` returns status
  - [ ] Microservices: Each `/health` endpoint works
  
- [ ] Logging
  - [ ] BFF logs all requests
  - [ ] Frontend logs API calls (debug mode)
  - [ ] Backend logs JWT validation
  
- [ ] Error tracking
  - [ ] Errors logged with timestamps
  - [ ] Stack traces available
  - [ ] Error codes meaningful

### Database

- [ ] User Service Database
  - [ ] H2 console accessible: http://localhost:8081/h2-console
  - [ ] Test users exist: `SELECT * FROM users;`
  
- [ ] Product Service Database
  - [ ] Products table exists
  - [ ] Can create products
  - [ ] Status field tracks approval state
  
- [ ] Order Service Database
  - [ ] Orders table exists
  - [ ] Can create orders
  - [ ] Order items tracked correctly
  
- [ ] Supply Service Database
  - [ ] Suppliers table exists
  - [ ] Inventory tracked

---

## Integration Testing Script

```bash
#!/bin/bash
echo "🔍 Running Integration Tests..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local expected_status=$4
  local data=$5
  local token=$6

  echo -e "\n${YELLOW}Testing:${NC} $name"
  
  local cmd="curl -s -w '%{http_code}' -X $method '$url'"
  
  if [ -n "$data" ]; then
    cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
  fi
  
  if [ -n "$token" ]; then
    cmd="$cmd -H 'Authorization: Bearer $token'"
  fi

  local status=$(eval $cmd | tail -c 4)
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
    ((FAILED++))
  fi
}

# Get tokens
echo -e "\n${YELLOW}Getting test tokens...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","role":"Customer"}')

CUSTOMER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Customer token: ${CUSTOMER_TOKEN:0:20}..."

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"supplier1","role":"Supplier"}')

SUPPLIER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Supplier token: ${SUPPLIER_TOKEN:0:20}..."

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"steward1","role":"Data Steward"}')

STEWARD_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Steward token: ${STEWARD_TOKEN:0:20}..."

# Run tests
echo -e "\n${YELLOW}Running Integration Tests${NC}\n"

test_endpoint "BFF Health" "GET" "http://localhost:3001/health" "200"
test_endpoint "Login" "POST" "http://localhost:3001/api/auth/login" "200" \
  '{"username":"customer1","role":"Customer"}'
test_endpoint "Get Products (Customer)" "GET" "http://localhost:3001/api/products" "200" "" "$CUSTOMER_TOKEN"
test_endpoint "Create Product (Supplier)" "POST" "http://localhost:3001/api/products" "201" \
  '{"name":"Test","price":29.99}' "$SUPPLIER_TOKEN"
test_endpoint "Create Product (Customer)" "POST" "http://localhost:3001/api/products" "403" \
  '{"name":"Test","price":29.99}' "$CUSTOMER_TOKEN"
test_endpoint "Missing Token" "GET" "http://localhost:3001/api/products" "401"

# Summary
echo -e "\n${YELLOW}Test Results:${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed!${NC}"
  exit 1
fi
```

Run the test script:
```bash
chmod +x integration-test.sh
./integration-test.sh
```

---

## Rollback/Recovery Procedures

### If Frontend Won't Load

```bash
# Clear cache and reload
rm -rf frontend/node_modules
npm install
npm start

# Or clear browser cache (Ctrl+Shift+Delete) then reload
```

### If BFF Won't Start

```bash
# Clear node_modules and reinstall
rm -rf bff/node_modules
npm install

# Check port is free
lsof -i :3001
kill -9 <PID>

# Start with debug
DEBUG=* npm start
```

### If Backend Service Won't Start

```bash
# Kill existing Java process
jps  # Find process ID
kill -9 <PID>

# Clean rebuild
cd backend/[service]
mvn clean install
mvn spring-boot:run
```

### If Database is Corrupted

```bash
# H2 auto-recreates on startup
# Just restart the service:
# Ctrl+C to stop
# Then restart the service

# Or manually clear (if persistent storage):
rm ~/[service]db.h2.db  # Windows: removes H2 file
```

---

## Key Metrics to Monitor

```javascript
// In BFF
const metrics = {
  requests: {
    total: 0,
    success: 0,
    failed: 0,
    avgResponseTime: 0
  },
  authentication: {
    logins: 0,
    tokenRefreshes: 0,
    failures: 0
  },
  roles: {
    Customer: 0,
    Supplier: 0,
    'Data Steward': 0
  }
};

// Track in middleware and report periodically
setInterval(() => {
  console.table(metrics);
}, 60000);
```

---

## Documentation Links

- **Full Integration Guide**: [END_TO_END_INTEGRATION.md](./END_TO_END_INTEGRATION.md)
- **Configuration Details**: [INTEGRATION_CONFIG.md](./INTEGRATION_CONFIG.md)
- **Debugging Handbook**: [INTEGRATION_DEBUGGING.md](./INTEGRATION_DEBUGGING.md)
- **API Documentation**: [api-specs/](./api-specs/)
- **BFF Architecture**: [backend/BFF-ARCHITECTURE.md](./backend/BFF-ARCHITECTURE.md)

---

## Support

If integration issues persist:

1. Check [INTEGRATION_DEBUGGING.md](./INTEGRATION_DEBUGGING.md) for step-by-step debugging
2. Review logs in all three layers (frontend console, BFF terminal, backend logs)
3. Verify configuration in [INTEGRATION_CONFIG.md](./INTEGRATION_CONFIG.md)
4. Run the integration test script above
5. Check common issues in [END_TO_END_INTEGRATION.md](./END_TO_END_INTEGRATION.md) section 5

---

**Save this page as your quick reference for integration validation.**

