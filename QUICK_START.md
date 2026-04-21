# Quick Start Guide - eCommerce Application

## Prerequisites
- Node.js 14+ and npm
- Java 11+ and Maven
- A terminal/command prompt

---

## Starting the Application

### Option 1: Using Batch Scripts (Windows)

```bash
# Run all services at once (recommended)
./run-all-services.bat

# Or run using JAR files directly
./run-all-services-jar.bat
```

### Option 2: Manual Start (All Platforms)

#### 1. Start Backend Services (in separate terminals)

```bash
# Terminal 1 - User Service (Port 8081)
cd backend/user-service
mvn clean install
mvn spring-boot:run
# OR: java -jar target/user-service-1.0.0.jar

# Terminal 2 - Product Service (Port 8082)
cd backend/product-service
mvn clean install
mvn spring-boot:run
# OR: java -jar target/product-service-1.0.0.jar

# Terminal 3 - Order Service (Port 8083)
cd backend/order-service
mvn clean install
mvn spring-boot:run
# OR: java -jar target/order-service-1.0.0.jar

# Terminal 4 - Supply Management Service (Port 8084)
cd backend/supply-management-service
mvn clean install
mvn spring-boot:run
# OR: java -jar target/supply-management-service-1.0.0.jar
```

#### 2. Start BFF (Backend for Frontend)

```bash
cd bff
npm install
npm start
# Runs on Port 3001
```

#### 3. Start Frontend

```bash
cd frontend
npm install
npm start
# Runs on Port 3000
# Browser opens automatically to http://localhost:3000
```

---

## Accessing the Application

### Frontend
- **URL**: http://localhost:3000
- **Login**: Use any test user (see credentials below)

### BFF API
- **Base URL**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api-docs (if configured)

### Backend Services
- **User Service**: http://localhost:8081
- **Product Service**: http://localhost:8082
- **Order Service**: http://localhost:8083
- **Supply Management**: http://localhost:8084

---

## Test Users (Local JWT Authentication)

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| customer1 | password123 | CUSTOMER | Browse & purchase products |
| customer2 | password123 | CUSTOMER | Browse & purchase products |
| supplier1 | password123 | SUPPLIER | Add & manage products |
| supplier2 | password123 | SUPPLIER | Add & manage products |
| datasteward1 | password123 | DATA_STEWARD | Approve/reject products |
| datasteward2 | password123 | DATA_STEWARD | Approve/reject products |

---

## User Workflows by Role

### Customer Workflow
1. Login with `customer1` / `password123`
2. Browse products (Products page)
3. View product details
4. Add to cart
5. View/manage cart
6. Checkout (creates order)
7. View orders history

### Supplier Workflow
1. Login with `supplier1` / `password123`
2. Go to "My Products" (Supplier Dashboard)
3. Add new product
4. Upload product details
5. Track product approval status
6. Update stock levels

### Data Steward Workflow
1. Login with `datasteward1` / `password123`
2. Go to "Admin Panel" (Data Steward Dashboard)
3. View pending approval products
4. Review product details
5. Approve or reject products
6. Manage user accounts

---

## API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/login           - Login with credentials
POST   /api/auth/logout          - Logout
GET    /api/auth/validate        - Validate JWT token
```

### Products
```
GET    /api/products             - List all products
GET    /api/products/{id}        - Get product details
POST   /api/products             - Create product (supplier)
PUT    /api/products/{id}        - Update product (supplier)
DELETE /api/products/{id}        - Delete product
GET    /api/search?q=query       - Search products
```

### Cart
```
GET    /api/cart                 - Get cart items
POST   /api/cart                 - Add item to cart
PUT    /api/cart/{itemId}        - Update cart item
DELETE /api/cart/{itemId}        - Remove from cart
POST   /api/cart/checkout        - Checkout
```

### Orders
```
GET    /api/orders               - Get user orders
GET    /api/orders/{id}          - Get order details
POST   /api/orders               - Create order
PUT    /api/orders/{id}          - Update order status
```

### Users (Admin)
```
GET    /api/users                - List all users
GET    /api/users/{id}           - Get user details
POST   /api/users                - Create user
PUT    /api/users/{id}           - Update user
DELETE /api/users/{id}           - Delete user
PATCH  /api/users/{id}/role      - Update user role
PATCH  /api/users/{id}/status    - Update user status
```

### Products Approval (Data Steward)
```
GET    /api/admin/products       - Get pending approvals
PUT    /api/admin/products/{id}/approve   - Approve product
PUT    /api/admin/products/{id}/reject    - Reject product
```

---

## Database

### H2 Console
Each service runs H2 in-memory database. Access consoles at:
- **User Service**: http://localhost:8081/h2-console
- **Product Service**: http://localhost:8082/h2-console
- **Order Service**: http://localhost:8083/h2-console
- **Supply Management**: http://localhost:8084/h2-console

**H2 Credentials**:
- **Driver**: `org.h2.Driver`
- **JDBC URL**: `jdbc:h2:mem:userdb` (or productdb, orderdb, supplierdb)
- **User**: `sa`
- **Password**: (leave empty)

---

## Troubleshooting

### Port Already in Use
If a service fails to start due to port conflicts:
```bash
# Windows - Find process using port
netstat -ano | findstr :8081

# Kill process
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8081
kill -9 <PID>
```

### Service Not Starting
1. Ensure Java 11+ is installed: `java -version`
2. Check Maven is installed: `mvn --version`
3. Check Node.js is installed: `node --version`
4. Try rebuilding: `mvn clean install` in service directory

### Database Connection Issues
1. H2 is an in-memory database - data is lost on restart
2. Tables auto-create on first run
3. Check application logs for SQL errors

### Frontend Cannot Connect to BFF
1. Ensure BFF is running on port 3001
2. Check CORS configuration in BFF
3. Check browser console for errors (F12)
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Authentication Issues
1. Ensure local JWT tokens are being created
2. Check token expiry time
3. Try logging out and in again
4. Clear localStorage if needed

---

## Project Structure

```
eCommerce-Application/
├── backend/
│   ├── user-service/          - Port 8081
│   ├── product-service/       - Port 8082
│   ├── order-service/         - Port 8083
│   └── supply-management-service/ - Port 8084
├── bff/                       - Port 3001
│   └── (Node.js Express server)
├── frontend/                  - Port 3000
│   ├── src/
│   │   ├── components/        - React components
│   │   ├── pages/            - Page components
│   │   ├── store/            - Redux slices
│   │   └── services/         - API services
├── docs/                      - Documentation
├── api-specs/                 - OpenAPI specifications
└── docker/                    - Docker configurations
```

---

## Next Steps / Development

### Immediate Tasks
- [ ] Test all user workflows
- [ ] Verify API responses
- [ ] Test cart functionality
- [ ] Test product approval workflow
- [ ] Load test with multiple users

### Enhancement Tasks
- [ ] Add product images
- [ ] Implement payment gateway
- [ ] Add email notifications
- [ ] Add product reviews/ratings
- [ ] Implement inventory alerts
- [ ] Add analytics dashboard

### Deployment Tasks
- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] AWS deployment
- [ ] CI/CD pipeline setup
- [ ] Environment variable management
- [ ] Secrets management

---

## Support & Documentation

- **Full Status**: See `IMPLEMENTATION_STATUS.md`
- **Auth Details**: See `LOCAL_AUTH_IMPLEMENTATION.md`
- **Service Docs**: See `RUN_SERVICES.md`
- **API Specs**: See `api-specs/` directory

---

**Last Updated**: 2024  
**Status**: ✅ Ready for Testing & Development
