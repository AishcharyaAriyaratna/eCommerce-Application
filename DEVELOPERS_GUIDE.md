# Developer's Guide - eCommerce Application

Complete guide to understanding and working with the eCommerce application codebase.

---

## Table of Contents
1. Architecture Overview
2. Frontend Development
3. Backend Service Development
4. BFF Development
5. Database Design
6. Authentication System
7. API Integration
8. Testing
9. Deployment
10. Common Tasks & Examples

---

## 1. Architecture Overview

### System Design Pattern
The application uses a **Micro Frontend + Microservices + BFF** architecture:

```
User Browser
    ↓
React Frontend (Port 3000)
    ↓
BFF/API Gateway (Port 3001) - Node.js
    ↓
Microservices Layer (Ports 8081-8084) - Spring Boot
    ├── User Service
    ├── Product Service
    ├── Order Service
    └── Supply Management Service
    ↓
Data Layer (H2 Databases)
```

### Benefits of This Architecture
- **Frontend Independence**: React app decoupled from backend
- **BFF Pattern**: Single entry point for frontend requests
- **Microservices**: Each service handles one domain (user, product, order, supplier)
- **Scalability**: Services can scale independently
- **Maintainability**: Clear separation of concerns
- **Testability**: Services can be tested independently

---

## 2. Frontend Development

### Technology Stack
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Language**: TypeScript & JavaScript
- **HTTP Client**: Axios (via apiService)
- **Build Tool**: Create React App

### Directory Structure
```
frontend/src/
├── components/          - Reusable React components
│   ├── Navigation.js   - Top navigation bar
│   ├── ProtectedRoute.js - Route protection wrapper
│   └── ...
├── pages/              - Full page components
│   ├── Dashboard.js    - Role-based dashboard
│   ├── CartPage.js     - Shopping cart
│   ├── ProductListingPage.js
│   └── ...
├── store/              - Redux store configuration
│   ├── slices/        - Redux slice files
│   │   ├── authSlice.js    - Authentication state
│   │   ├── cartSlice.js    - Cart state
│   │   ├── productSlice.js - Product state
│   │   └── orderSlice.js   - Order state
│   └── store.js        - Redux store setup
├── services/          - API service files
│   ├── apiService.js   - HTTP client wrapper
│   └── authService.js  - Auth-specific services
├── App.js             - Main app component & routing
└── index.js           - Entry point
```

### Key Concepts

#### Redux Store Structure
```javascript
// Store state shape
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  cart: {
    items: [],
    total: 0,
    count: 0
  },
  products: {
    items: [],
    filters: {},
    loading: false,
    error: null
  },
  orders: {
    items: [],
    loading: false,
    error: null
  }
}
```

#### Understanding Redux Slices
Each slice contains:
- **State**: Initial state shape
- **Reducers**: Functions that modify state
- **Selectors**: Functions to read state
- **ExtraReducers**: Handlers for async actions

Example pattern:
```javascript
// Using Redux in a component
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../store/slices/authSlice';

function MyComponent() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return <div>{user?.username}</div>;
}
```

#### Authentication Flow
1. User submits login form
2. `LoginPage.js` calls `authService.login()`
3. Service makes POST to `/api/auth/login`
4. BFF returns JWT token
5. Token stored in Redux `authSlice`
6. Token added to all subsequent API requests
7. Protected routes read `isAuthenticated` from Redux

### Adding New Pages
1. Create `.js` or `.tsx` file in `src/pages/`
2. Export React functional component
3. Update `App.js` with new route:
```javascript
<Route path="/newpage" element={<NewPage />} />
```
4. Update Navigation.js if adding menu item
5. Import any Redux selectors needed
6. Add API calls via apiService

### Adding New Redux Slices
1. Create file in `src/store/slices/newSlice.js`
2. Define initial state, reducers, and selectors:
```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = { /* your state */ };

const newSlice = createSlice({
  name: 'newSlice',
  initialState,
  reducers: {
    action1: (state, action) => { /* modify state */ },
    action2: (state, action) => { /* modify state */ }
  }
});

export const selectData = state => state.newSlice.data;
export const { action1, action2 } = newSlice.actions;
export default newSlice.reducer;
```
3. Add reducer to `store.js`:
```javascript
configureStore({
  reducer: {
    newSlice: newSliceReducer
  }
})
```

---

## 3. Backend Service Development

### Technology Stack
- **Framework**: Spring Boot 2.7+
- **Language**: Java 11+
- **Build Tool**: Maven
- **Database**: H2 (in-memory)
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT

### Service Architecture
Each microservice follows standard structure:

```
service-name/
├── src/main/java/com/ecommerce/
│   ├── controller/     - REST endpoints
│   ├── service/        - Business logic
│   ├── repository/     - Data access
│   ├── entity/         - JPA entities
│   ├── dto/            - Data transfer objects
│   ├── security/       - Security config
│   └── Application.java - Spring Boot app
├── src/main/resources/
│   ├── application.properties - Config
│   └── data.sql        - Initial data
└── pom.xml            - Maven dependencies
```

### Creating a New Endpoint

**Step 1: Create Entity**
```java
@Entity
@Table(name = "my_entity")
@Data
@NoArgsConstructor
public class MyEntity {
  @Id
  @GeneratedValue
  private Long id;
  
  @Column(nullable = false)
  private String name;
}
```

**Step 2: Create Repository**
```java
@Repository
public interface MyEntityRepository extends JpaRepository<MyEntity, Long> {
  List<MyEntity> findByName(String name);
}
```

**Step 3: Create Service**
```java
@Service
@RequiredArgsConstructor
public class MyEntityService {
  private final MyEntityRepository repository;
  
  public MyEntity create(MyEntity entity) {
    return repository.save(entity);
  }
  
  public MyEntity findById(Long id) {
    return repository.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Not found"));
  }
}
```

**Step 4: Create Controller**
```java
@RestController
@RequestMapping("/api/entities")
@RequiredArgsConstructor
public class MyEntityController {
  private final MyEntityService service;
  
  @PostMapping
  @PreAuthorize("hasAnyRole('CUSTOMER','SUPPLIER')")
  public MyEntity create(@RequestBody MyEntity entity) {
    return service.create(entity);
  }
  
  @GetMapping("/{id}")
  public MyEntity getById(@PathVariable Long id) {
    return service.findById(id);
  }
}
```

### Role-Based Access Control
Use `@PreAuthorize` annotation:
```java
@GetMapping("/admin")
@PreAuthorize("hasRole('DATA_STEWARD')")
public List<User> getAllUsers() { ... }

@PostMapping
@PreAuthorize("hasAnyRole('CUSTOMER','SUPPLIER')")
public void create(...) { ... }
```

Available roles:
- `CUSTOMER` - Regular users
- `SUPPLIER` - Product suppliers
- `DATA_STEWARD` - Administrators

### Application Properties
```properties
# Server
server.port=8081
spring.application.name=user-service

# Database
spring.datasource.url=jdbc:h2:mem:userdb
spring.h2.console.enabled=true

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false

# JWT
jwt.secret=your-secret-key
jwt.expiration-ms=86400000
```

### Handling Errors
Create custom exceptions:
```java
public class EntityNotFoundException extends RuntimeException {
  public EntityNotFoundException(String message) {
    super(message);
  }
}
```

Create exception handler:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<?> handle(EntityNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(new ErrorResponse(e.getMessage()));
  }
}
```

---

## 4. BFF Development

### What is BFF?
Backend For Frontend - Acts as:
- API Gateway (routes requests to microservices)
- Response Aggregator (combines data from multiple services)
- Security Layer (validates JWT tokens)
- CORS Handler (manages cross-origin requests)

### Technology Stack
- **Framework**: Express.js
- **Language**: JavaScript/Node.js
- **HTTP Client**: Axios
- **JWT**: jsonwebtoken
- **Environment**: .env file for config

### Project Structure
```
bff/
├── routes/         - Express route files
├── middleware/     - Custom middleware
├── controllers/    - Request handlers
├── auth/          - Authentication logic
├── services/      - Service calls to microservices
├── config/        - Configuration files
├── app.js         - Express app setup
├── server.js      - Start script
├── package.json
└── .env          - Environment variables
```

### Creating New Routes

**Step 1: Define Route File** (`routes/users.js`)
```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// GET /api/users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.get(`${USER_SERVICE_URL}/api/users`, {
      headers: { 'Authorization': token }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500)
       .json({ error: error.message });
  }
});

module.exports = router;
```

**Step 2: Register Route** (`app.js`)
```javascript
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
```

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Environment Variables (.env)
```
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-key

USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLY_SERVICE_URL=http://localhost:8084

CORS_ORIGIN=http://localhost:3000
```

### Starting BFF
```bash
cd bff
npm install
npm start
# Server runs on http://localhost:3001
```

---

## 5. Database Design

### Database per Service Pattern
Each microservice has independent database:

#### User Service Database
```
TABLE users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── role (CUSTOMER/SUPPLIER/DATA_STEWARD)
├── status (ACTIVE/INACTIVE/SUSPENDED)
├── created_at
├── updated_at
```

#### Product Service Database
```
TABLE products
├── id (PK)
├── name
├── description
├── price
├── supplier_id (FK to user)
├── category
├── status (PENDING/APPROVED/REJECTED)
├── approved_by (FK to user)
├── created_at
├── updated_at

INDEX: supplier_id, status, category
```

#### Order Service Database
```
TABLE orders
├── id (PK)
├── customer_id (FK)
├── status (PENDING/PROCESSING/SHIPPED/DELIVERED)
├── total_price
├── created_at

TABLE order_items
├── id (PK)
├── order_id (FK)
├── product_id
├── quantity
├── price_at_purchase
```

#### Supply Management Database
```
TABLE supplier_inventory
├── id (PK)
├── supplier_id (FK)
├── product_id
├── stock_quantity
├── last_updated
```

---

## 6. Authentication System

### Local JWT Authentication (Development)
- Uses JWT tokens instead of AWS Cognito
- Tokens are generated and validated locally
- Perfect for development and testing

### Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  sub: user_id,
  username: "username",
  role: "CUSTOMER",
  iat: 1234567890,
  exp: 1234667890
}
Signature: HMAC_SHA256(header.payload, secret)
```

### Login Flow
1. Frontend sends username + password to BFF
2. BFF queries User Service for user
3. BFF validates password
4. BFF generates JWT token
5. Frontend stores token in Redux
6. Frontend includes token in Auth header for subsequent requests

### Token Validation
Every API request includes:
```
Authorization: Bearer <token>
```

Backend validates:
1. Token signature is valid
2. Token hasn't expired
3. User role is authenticated

---

## 7. API Integration

### Using apiService (Frontend)
```javascript
// services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// In components:
import apiService from '../services/apiService';

const products = await apiService.get('/products');
const order = await apiService.post('/orders', { items: [...] });
```

### Error Handling
```javascript
try {
  const data = await apiService.get('/endpoint');
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
    store.dispatch(logout());
  } else if (error.response?.status === 403) {
    // Handle forbidden
    navigate('/dashboard');
  } else {
    // Handle other errors
    console.error(error.message);
  }
}
```

---

## 8. Testing

### Frontend Testing
```bash
cd frontend
npm test                  # Run tests
npm test -- --coverage   # With coverage
```

### Backend Testing
```bash
cd backend/service-name
mvn test                 # Run unit tests
mvn test -DskipTests     # Skip tests during build
```

### Integration Testing
Start all services and run Postman/curl tests:
```bash
# Example: Login and get products
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"password123"}'

# Response will include JWT token
# Use token in subsequent requests
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>"
```

---

## 9. Deployment

### Docker Containerization
Each service has Dockerfile:

```dockerfile
# Dockerfile
FROM maven:3.8.1-openjdk-11 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:11-jre-slim
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Building Images
```bash
# From each service directory
docker build -t user-service:1.0 .

# Push to registry
docker tag user-service:1.0 myregistry/user-service:1.0
docker push myregistry/user-service:1.0
```

### Docker Compose
```yaml
version: '3'
services:
  frontend:
    image: ecommerce-frontend:1.0
    ports:
      - "3000:3000"
  
  bff:
    image: ecommerce-bff:1.0
    ports:
      - "3001:3001"
  
  user-service:
    image: user-service:1.0
    ports:
      - "8081:8081"
  
  product-service:
    image: product-service:1.0
    ports:
      - "8082:8082"
```

---

## 10. Common Tasks & Examples

### Adding a New Feature: Product Reviews

**1. Backend: Add Review Entity**
```java
@Entity
public class ProductReview {
  @Id
  @GeneratedValue
  private Long id;
  
  @ManyToOne
  @JoinColumn(name = "product_id")
  private Product product;
  
  private Long customerId;
  private Integer rating;
  private String comment;
}
```

**2. Backend: Add Repository**
```java
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
  List<ProductReview> findByProductId(Long productId);
  List<ProductReview> findByCustomerId(Long customerId);
}
```

**3. Backend: Add Service & Controller**
```java
@Service
public class ProductReviewService {
  public ProductReview createReview(ProductReview review) {
    return repository.save(review);
  }
  
  public List<ProductReview> getProductReviews(Long productId) {
    return repository.findByProductId(productId);
  }
}

@RestController
@RequestMapping("/api/reviews")
public class ProductReviewController {
  @PostMapping
  public ProductReview createReview(@RequestBody ProductReview review) {
    return service.createReview(review);
  }
  
  @GetMapping("/product/{productId}")
  public List<ProductReview> getProductReviews(@PathVariable Long productId) {
    return service.getProductReviews(productId);
  }
}
```

**4. BFF: Add Route**
```javascript
router.post('/reviews', authMiddleware, async (req, res) => {
  const review = req.body;
  const response = await axios.post(
    `${PRODUCT_SERVICE_URL}/api/reviews`,
    review,
    { headers: { 'Authorization': req.headers.authorization } }
  );
  res.json(response.data);
});
```

**5. Frontend: Add Review Component**
```javascript
function ProductReview({ productId }) {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    apiService.get(`/reviews/product/${productId}`)
      .then(res => setReviews(res.data));
  }, [productId]);
  
  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>
          <p>{review.rating}★ - {review.comment}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Useful Resources

- **Install Guide**: See `QUICK_START.md`
- **Service Documentation**: See `RUN_SERVICES.md`
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **API Specifications**: See `api-specs/` directory

---

**Last Updated**: 2024  
**Version**: 1.0.0
