# eCommerce Microservices - Complete Guide

## Overview

This guide provides comprehensive instructions for building, running, and using the four independent Spring Boot microservices that form the backend of the eCommerce platform. Each service is independently deployable with its own database and REST API.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)                │
│                      (Port 3000)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              Backend for Frontend (BFF) - Node.js               │
│                 Express Server (Port 3001)                      │
├─────────────────────────────────────────────────────────────────┤
│ • JWT Token Generation & Validation                             │
│ • API Gateway to Backend Services                               │
│ • CORS Management                                               │
└──┬───────┬────────────────┬────────────────┬───────────────────┘
   │       │                │                │
   ▼       ▼                ▼                ▼
┌──────┐ ┌──────┐      ┌────────┐      ┌──────────┐
│User  │ │Prodt │      │ Order  │      │ Supply   │
│Srvc  │ │ Srvc │      │ Srvc   │      │ Mgmt     │
│      │ │      │      │        │      │ Srvc     │
│8081  │ │8082  │      │ 8083   │      │ 8084     │
└──────┘ └──────┘      └────────┘      └──────────┘
   │       │                │                │
   ▼       ▼                ▼                ▼
┌──────┐ ┌──────┐      ┌────────┐      ┌──────────┐
│ H2   │ │ H2   │      │  H2    │      │   H2     │
│user  │ │prod  │      │ order  │      │ supplier │
│DB    │ │DB    │      │ DB     │      │ DB       │
└──────┘ └──────┘      └────────┘      └──────────┘
```

---

## Services Overview

### 1. User Service (Port 8081)
**Responsibility**: User account management and authentication support

**Key Features**:
- User CRUD operations
- Role management (CUSTOMER, SUPPLIER, DATA_STEWARD)
- User status tracking (ACTIVE, INACTIVE, SUSPENDED)
- User search and filtering

**Database**: H2 in-memory (userdb)

**Key Endpoints**:
```
GET    /api/users                          - List all users (Data Steward)
GET    /api/users/{id}                     - Get user by ID
GET    /api/users/username/{username}      - Get user by username
POST   /api/users                          - Create user
PUT    /api/users/{id}                     - Update user
PATCH  /api/users/{id}/status              - Update user status
PATCH  /api/users/{id}/role                - Change user role
DELETE /api/users/{id}                     - Delete user
```

---

### 2. Product Service (Port 8082)
**Responsibility**: Product catalog management with approval workflows

**Key Features**:
- Product CRUD operations
- Product approval workflow (PENDING → APPROVED/REJECTED)
- Inventory management (stock tracking)
- Search by category, name, supplier
- Role-based product visibility

**Database**: H2 in-memory (productdb)

**Key Endpoints**:
```
GET    /api/products                       - All products
GET    /api/products/{id}                  - Get product by ID
GET    /api/products/category/{category}   - Browse by category (approved only)
GET    /api/products/search?name=          - Search products by name
GET    /api/products/supplier/{supplierId} - Get supplier's products
GET    /api/products/status/pending        - Pending approval (Data Steward)
POST   /api/products                       - Create product (Supplier)
POST   /api/products/{id}/approve          - Approve product (Data Steward)
POST   /api/products/{id}/reject           - Reject product (Data Steward)
PATCH  /api/products/{id}/stock            - Update inventory
DELETE /api/products/{id}                  - Delete product (Supplier)
```

---

### 3. Order Service (Port 8083)
**Responsibility**: Order management and fulfillment tracking

**Key Features**:
- Order creation with multiple items
- Order status lifecycle (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Order item management
- Customer order history
- Order tracking by order number

**Database**: H2 in-memory (orderdb)

**Key Endpoints**:
```
GET    /api/orders                         - All orders (Data Steward)
GET    /api/orders/{id}                    - Get order by ID
GET    /api/orders/number/{orderNumber}    - Get order by order number
GET    /api/orders/customer/{customerId}   - Customer's orders
POST   /api/orders                         - Create order (Customer)
POST   /api/orders/{id}/items              - Add items to order
DELETE /api/orders/{orderId}/items/{itemId} - Remove item from order
PATCH  /api/orders/{id}/confirm            - Confirm order (Customer)
PATCH  /api/orders/{id}/ship               - Ship order (Data Steward)
PATCH  /api/orders/{id}/deliver            - Mark as delivered (Data Steward)
PATCH  /api/orders/{id}/cancel             - Cancel order
DELETE /api/orders/{id}                    - Delete order
```

---

### 4. Supply Management Service (Port 8084)
**Responsibility**: Supplier account management and approval

**Key Features**:
- Supplier registration and profile management
- Supplier approval workflow (PENDING_APPROVAL → ACTIVE)
- Supplier status management (ACTIVE, INACTIVE, SUSPENDED)
- Search suppliers by name, email, country
- Product count tracking per supplier

**Database**: H2 in-memory (supplierdb)

**Key Endpoints**:
```
GET    /api/suppliers                      - All suppliers (Data Steward)
GET    /api/suppliers/{id}                 - Get supplier by ID
GET    /api/suppliers/name/{name}          - Search by company name
GET    /api/suppliers/email/{email}        - Search by email (Data Steward)
GET    /api/suppliers/status/active        - List active suppliers (public)
GET    /api/suppliers/status/pending       - Pending approval (Data Steward)
GET    /api/suppliers/country/{country}    - Filter by country (Data Steward)
POST   /api/suppliers                      - Register supplier
PUT    /api/suppliers/{id}                 - Update supplier info
POST   /api/suppliers/{id}/approve         - Approve supplier (Data Steward)
POST   /api/suppliers/{id}/reject          - Reject supplier (Data Steward)
PATCH  /api/suppliers/{id}/suspend         - Suspend supplier (Data Steward)
PATCH  /api/suppliers/{id}/activate        - Reactivate supplier
DELETE /api/suppliers/{id}                 - Delete supplier
```

---

## Building the Services

### Prerequisites
- **Java 17** (or later)
- **Maven 3.8.9** (or later)

### Build All Services at Once

```bash
cd backend
mvn clean install
```

### Build Individual Services

```bash
# User Service
cd backend/user-service
mvn clean install

# Product Service
cd backend/product-service
mvn clean install

# Order Service
cd backend/order-service
mvn clean install

# Supply Management Service
cd backend/supply-management-service
mvn clean install
```

### Build Output
Each service produces:
- **Compiled Classes**: `target/classes/`
- **Executable JAR**: `target/user-service-1.0.0.jar` (example for user service)
- **Dependencies**: `target/dependencies/`

---

## Running the Services

### Option 1: Using Maven (Recommended for Development)

**Advantages**: Auto-reload on code changes, easier debugging

Open four terminal windows and run:

```bash
# Terminal 1 - User Service
cd backend/user-service
mvn spring-boot:run
# Output: Started UserServiceApplication in X.XXX seconds

# Terminal 2 - Product Service
cd backend/product-service
mvn spring-boot:run
# Output: Started ProductServiceApplication in X.XXX seconds

# Terminal 3 - Order Service
cd backend/order-service
mvn spring-boot:run
# Output: Started OrderServiceApplication in X.XXX seconds

# Terminal 4 - Supply Management Service
cd backend/supply-management-service
mvn spring-boot:run
# Output: Started SupplyManagementServiceApplication in X.XXX seconds
```

### Option 2: Using JAR Files (Production-like)

**Advantages**: Mimics actual deployment, can specify custom ports

```bash
# User Service
java -jar backend/user-service/target/user-service-1.0.0.jar

# Product Service
java -jar backend/product-service/target/product-service-1.0.0.jar

# Order Service
java -jar backend/order-service/target/order-service-1.0.0.jar

# Supply Management Service
java -jar backend/supply-management-service/target/supply-management-service-1.0.0.jar
```

### Option 3: Custom Configuration

Pass custom properties to JAR:

```bash
java -jar user-service-1.0.0.jar --server.port=9081 --spring.h2.console.enabled=true
```

---

## H2 Database Console Access

Each service exposes an H2 console for database inspection and direct SQL execution.

### Console URLs

| Service | URL | JDBC URL | Username | Password |
|---------|-----|----------|----------|----------|
| User | http://localhost:8081/h2-console | jdbc:h2:mem:userdb | sa | (empty) |
| Product | http://localhost:8082/h2-console | jdbc:h2:mem:productdb | sa | (empty) |
| Order | http://localhost:8083/h2-console | jdbc:h2:mem:orderdb | sa | (empty) |
| Supply | http://localhost:8084/h2-console | jdbc:h2:mem:supplierdb | sa | (empty) |

### H2 Login Steps
1. Navigate to the H2 console URL
2. Enter JDBC URL from table above
3. Enter username: `sa`
4. Leave password blank
5. Click "Connect"

---

## API Authentication & Authorization

### Authentication Flow

1. **User logs in via Frontend**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { username: "customer1", role: "CUSTOMER" }
   Response: { token: "eyJhbGc..." }
   ```

2. **Frontend stores JWT token**
   ```
   localStorage.setItem('token', token)
   ```

3. **All API requests include token**
   ```
   Authorization: Bearer eyJhbGc...
   ```

4. **Services validate token**
   - Token comes from BFF
   - Spring Security annotations protect endpoints
   - @PreAuthorize checks user role

### Role-Based Access Control

Three roles with specific permissions:

**CUSTOMER**:
- Browse approved products by category
- View own profile
- Create orders
- Manage own orders
- Not allowed: Approve products, manage users, view all orders

**SUPPLIER**:
- Create/update products
- View own products
- Manage own profile
- Cannot: Approve products, see other suppliers' products

**DATA_STEWARD**:
- Full access to all endpoints
- Approve/reject products
- Manage all users
- Suspend/activate suppliers
- View all orders
- Access all admin functions

### Example Authorization Annotations

```java
// Only Data Stewards
@PreAuthorize("hasAnyRole('DATA_STEWARD')")
@GetMapping("/api/users")
public ResponseEntity<List<UserDTO>> getAllUsers()

// Customers only
@PreAuthorize("hasAnyRole('CUSTOMER')")
@PostMapping("/api/orders")
public ResponseEntity<OrderDTO> createOrder()

// Suppliers and Data Stewards
@PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
@GetMapping("/api/products/supplier/{supplierId}")
public ResponseEntity<List<ProductDTO>> getSupplierProducts()
```

---

## Test User Credentials

The frontend provides predefined test users for local development:

```
CUSTOMER Role:
  Username: customer1  | Role: CUSTOMER
  Username: customer2  | Role: CUSTOMER

SUPPLIER Role:
  Username: supplier1  | Role: SUPPLIER
  Username: supplier2  | Role: SUPPLIER

DATA_STEWARD Role:
  Username: steward1   | Role: DATA_STEWARD
  Username: steward2   | Role: DATA_STEWARD
```

All users can log in without a password in the development environment. Login is handled by the BFF's local JWT authentication system.

---

## Example cURL Requests

### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","role":"CUSTOMER"}'
```

### 2. Get Products by Category
```bash
curl -X GET "http://localhost:8082/api/products/category/Electronics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create Order
```bash
curl -X POST http://localhost:8083/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":1,
    "shippingAddress":"123 Main St",
    "billingAddress":"123 Main St",
    "items":[
      {"productId":1,"quantity":2},
      {"productId":3,"quantity":1}
    ]
  }'
```

### 4. Approve Product
```bash
curl -X POST http://localhost:8082/api/products/1/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stewardId":1}'
```

### 5. Ship Order
```bash
curl -X PATCH http://localhost:8083/api/orders/1/ship \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Service Port Reference

| Service | Port | Database | Context Path |
|---------|------|----------|--------------|
| User Service | 8081 | userdb | / |
| Product Service | 8082 | productdb | / |
| Order Service | 8083 | orderdb | / |
| Supply Mgmt Service | 8084 | supplierdb | / |
| BFF (Node.js) | 3001 | N/A | / |
| Frontend (React) | 3000 | N/A | / |

---

## Database Initialization

Each service uses Hibernate's automatic schema generation (`hibernate.ddl-auto: update` in `application.yml`).

- **First Run**: Creates tables automatically
- **Subsequent Runs**: Updates schema if entities change
- **Data**: H2 stores data in memory, resets on service restart

To initialize with sample data, add to `data.sql` in `src/main/resources/`:

```sql
-- src/main/resources/data.sql
INSERT INTO users (username, email, role, status) 
VALUES ('testuser', 'test@example.com', 'CUSTOMER', 'ACTIVE');
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8081
lsof -i :8081

# Kill process
kill -9 <PID>

# Or start service on different port
java -jar service.jar --server.port=9081
```

### Spring Security Issues
- Ensure JWT token is valid and not expired (1 hour in local config)
- Check user role matches @PreAuthorize requirements
- Verify Authorization header format: `Bearer <token>`

### Database Issues
- H2 data is in-memory, persists only during service runtime
- To persist H2 data, change `jdbc:h2:mem:` to `jdbc:h2:file:~/ecommerce/`
- Access H2 console to inspect tables and data

### Build Compilation Errors
```bash
# Clean Maven cache
mvn clean

# Rebuild with verbose output
mvn clean install -X

# Check Java version (should be 17+)
java -version
```

---

## Development Workflow

### Standard Workflow for Feature Development

1. **Start all services** in separate terminals
2. **Modify entity/service code** in one service
3. **Run service rebuild**:
   ```bash
   # If using mvn spring-boot:run, changes auto-reload
   # If using JAR, rebuild: mvn clean install
   ```
4. **Test endpoints** with cURL or Postman
5. **Check H2 console** to verify database changes

### Running Specific Tests

```bash
# Skip tests during build
mvn clean install -DskipTests

# Run all tests
mvn clean install

# Run single test class
mvn test -Dtest=UserServiceTest
```

---

## Performance Considerations

### H2 In-Memory Database
- **✓ Fast**: No disk I/O
- **✗ Limited**: Single JVM process only
- **✗ Volatile**: Data lost on restart
- **Use case**: Development and testing only

### Production Deployment
For production, replace H2 with persistent database:
- PostgreSQL
- MySQL
- Oracle
- SQL Server

Update `application.yml`:
```yaml
datasource:
  url: jdbc:postgresql://localhost:5432/ecommerce_user
  username: postgres
  password: secret
```

---

## Next Steps for Production

1. **Add Service-to-Service Communication**
   - Use Spring Cloud Feign clients
   - Or RestTemplate with service discovery
   - Example: Order Service calls Product Service to validate products

2. **Add API Gateway**
   - Spring Cloud Gateway
   - Single entry point for all services
   - Centralized authentication/authorization

3. **Add Service Discovery**
   - Spring Cloud Eureka
   - Dynamic service registration
   - Load balancing

4. **Add Resilience**
   - Circuit breakers (Hystrix/Resilience4j)
   - Retry logic
   - Timeouts

5. **Add Monitoring**
   - Spring Boot Actuator
   - Prometheus metrics
   - ELK stack for logging

6. **Add Caching**
   - Redis for session/data caching
   - Distributed caching for services

7. **Containerization**
   - Docker containers for each service
   - Docker Compose for local development
   - Kubernetes for production orchestration

---

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [H2 Database Documentation](http://www.h2database.com/)
- [Microservices Architecture](https://microservices.io/)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Development Ready
