# Architecture & Infrastructure Guide

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                  │
│                                                                       │
│              ┌──────────────────────────────────┐                   │
│              │  React 18 Frontend              │                   │
│              │  • TypeScript & JavaScript      │                   │
│              │  • Redux State Management       │                   │
│              │  • Role-based Routing           │                   │
│              │  Port 3000                      │                   │
│              └──────────────┬───────────────────┘                   │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                     HTTP/HTTPS (JSON)
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                    API GATEWAY TIER (BFF)                            │
│                                                                       │
│         ┌────────────────────────────────────────┐                  │
│         │  Backend For Frontend (Node.js)        │                  │
│         │  • Express.js Framework                │                  │
│         │  • JWT Authentication                  │                  │
│         │  • Request Routing                     │                  │
│         │  • Response Aggregation                │                  │
│         │  • CORS Management                     │                  │
│         │  Port 3001                             │                  │
│         └────────────────┬───────────────────────┘                  │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        │                  │                  │                  │
REST API (JSON)            │                  │                  │
        │                  │                  │                  │
┌───────▼──────┐ ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼──────┐
│   USER SVC   │ │  PRODUCT SVC    │ │  ORDER SVC  │ │  SUPPLY MGMT  │
│  Port 8081   │ │  Port 8082      │ │  Port 8083  │ │  Port 8084    │
└───────┬──────┘ └────────┬────────┘ └──────┬──────┘ └────────┬──────┘
        │                  │                  │                  │
    ┌───▼──┐           ┌───▼──┐          ┌───▼──┐           ┌───▼──┐
    │ H2   │           │ H2   │          │ H2   │           │ H2   │
    │userdb│           │proddb│          │orddb │           │suppdb│
    └──────┘           └──────┘          └──────┘           └──────┘
```

### Technology Stack by Layer

#### Frontend Layer
```
React 18
├── TypeScript & JavaScript
├── Redux Toolkit (State Management)
├── React Router v6 (Routing)
├── Axios (HTTP Client)
└── CSS-in-JS (Inline Styles)
```

#### API Gateway Layer (BFF)
```
Node.js + Express.js
├── jsonwebtoken (JWT Auth)
├── axios (HTTP Client)
├── cors (Cross-Origin)
├── dotenv (Environment)
└── morgan (Logging)
```

#### Microservices Layer
```
Spring Boot 2.7+ Java 11+
├── Spring Security (Authentication/Authorization)
├── Spring Data JPA (ORM)
├── H2 Database (In-memory)
├── Lombok (Code Generation)
├── Validation (JSR-303)
└── Exception Handling
```

---

## Component Interaction Flows

### 1. User Login Flow

```
User (Browser)
    ↓ Enter username/password
Frontend LoginPage.js
    ↓ POST /api/auth/login
BFF /routes/auth.js
    ↓ Forward to User Service
User Service /api/users/authenticate
    ↓ Validate credentials
BFF (Generate JWT)
    ↓ Return JWT token
Frontend (Store in Redux)
    ├─ Redux: authSlice.token = jwt
    ├─ Redux: authSlice.user = {username, role, ...}
    ├─ Redux: authSlice.isAuthenticated = true
    └─ Navigate to /dashboard
```

### 2. Add to Cart Flow

```
User Clicks "Add to Cart"
    ↓
Frontend CartPage.js
    ↓ dispatch(addToCart(product))
Redux cartSlice
    ├─ Add item to items[]
    └─ Recalculate total
    ↓
Component re-renders
    └─ Show updated cart count
```

### 3. Product Approval Flow

```
Supplier adds product → Product Service (PENDING)
    ↓
Data Steward sees pending products in Admin Dashboard
    ↓
Click "Approve" button
    ↓ PUT /api/admin/products/{id}/approve
BFF → Product Service
    ↓
Product status changes to APPROVED
    ↓
Product now visible to customers in Product Listing
```

### 4. Order Creation Flow

```
Customer clicks "Checkout"
    ↓
Frontend gets cart items from Redux
    ↓ POST /api/orders
BFF → Order Service
    ↓
Order Service creates order with items
    ↓
Return order confirmation
    ↓
Frontend clears cart (Redux)
    ├─ dispatch(clearCart())
    └─ Navigate to /orders
```

---

## Data Flow Diagrams

### Request Processing Pipeline

```
Browser Request
    ↓
Frontend API Call (with JWT token)
    ↓
BFF Middleware
├─ CORS check
├─ JWT validation
└─ Route determination
    ↓
Service Router
├─ /api/users → User Service
├─ /api/products → Product Service
├─ /api/orders → Order Service
└─ /api/suppliers → Supply Management Service
    ↓
Spring Boot Service
├─ Controller (Endpoint)
├─ Service (Business Logic)
├─ Repository (Database Access)
└─ Entity (Data Model)
    ↓
H2 Database
    ↓
Response (JSON)
    ↓
BFF Response Aggregation
    ↓
Frontend (Update Redux → Re-render)
    ↓
Updated UI to User
```

---

## Database Schema Overview

### User Service Database (userdb)

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_role ON users(role);
```

### Product Service Database (productdb)

```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  supplier_id BIGINT NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) NOT NULL,
  approved_by BIGINT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE product_reviews (
  id BIGINT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP
);

CREATE INDEX idx_supplier ON products(supplier_id);
CREATE INDEX idx_status ON products(status);
CREATE INDEX idx_category ON products(category);
```

### Order Service Database (orderdb)

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT,
  product_name VARCHAR(255),
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10,2),
  created_at TIMESTAMP
);

CREATE INDEX idx_customer ON orders(customer_id);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_order ON order_items(order_id);
```

### Supply Management Database (supplierdb)

```sql
CREATE TABLE suppliers (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  company_name VARCHAR(255),
  registration_date TIMESTAMP,
  status VARCHAR(20)
);

CREATE TABLE inventory (
  id BIGINT PRIMARY KEY,
  supplier_id BIGINT NOT NULL,
  product_id BIGINT,
  stock_quantity INT,
  last_updated TIMESTAMP
);

CREATE INDEX idx_supplier ON suppliers(user_id);
CREATE INDEX idx_inventory_supplier ON inventory(supplier_id);
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────┐
│   Frontend (React)                  │
│   • Stores JWT in Redux             │
│   • Attaches token to requests      │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   BFF (Node.js)                     │
│   • Validates JWT signature         │
│   • Extracts user info              │
│   • Forwards token to services      │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   Spring Boot Services              │
│   • Validates JWT                   │
│   • Checks @PreAuthorize roles      │
│   • Validates user permissions      │
└─────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

```
Roles:
├── CUSTOMER
│   ├── Browse products
│   ├── Manage cart
│   ├── Create orders
│   └── View own orders
├── SUPPLIER
│   ├── Add products
│   ├── Update products
│   ├── Manage inventory
│   └── View sales
└── DATA_STEWARD
    ├── Approve products
    ├── Reject products
    ├── Manage users
    └── View reports
```

---

## Performance Considerations

### Frontend Optimization
```
React Optimization:
├── PureComponent / React.memo for components
├── useCallback for function memoization
├── Redux selector memoization
├── Code splitting with React.lazy
├── Lazy load routes
└── Image optimization
```

### Backend Optimization
```
Spring Boot Performance:
├── Database indexing on frequently queried columns
├── Query pagination for large result sets
├── Caching with Spring Cache
├── Connection pooling
├── Async processing for long operations
└── Load testing for bottlenecks
```

### BFF Optimization
```
Node.js Performance:
├── Connection pooling to microservices
├── Request caching
├── Response compression (gzip)
├── Timeout management
├── Rate limiting
└── Load balancing
```

---

## Scalability Architecture

### Horizontal Scaling

```
┌─────────────────────────────────────┐
│   Load Balancer (AWS ALB)           │
├─────────────────────────────────────┤
│   Frontend Instances (Multiple)     │
│   └─ React App (Scale with CDN)     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   API Gateway (Kong / AWS API GW)   │
├─────────────────────────────────────┤
│   BFF Instances (Auto-scaling)      │
│   └─ Node.js Servers                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Service Mesh (Optional)           │
├─────────────────────────────────────┤
│   Microservice Instances            │
│   ├─ User Service (Multiple)        │
│   ├─ Product Service (Multiple)     │
│   ├─ Order Service (Multiple)       │
│   └─ Supply Service (Multiple)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Database Layer                    │
├─────────────────────────────────────┤
│   ├─ RDS PostgreSQL (Replicated)    │
│   ├─ RDS for each service           │
│   └─ Read replicas for scaling      │
└─────────────────────────────────────┘
```

### Database Scaling

```
Each Microservice:
├── Master Database (Write)
├── Read Replicas (Read)
└── Connection Pool

Caching Layer:
├── Redis for session data
├── Memcached for query results
└── CDN for static assets
```

---

## Monitoring & Observability

### Logging Architecture

```
Application Logs
    ↓
┌─────────────────────────────────────┐
│   Centralized Logging               │
│   (ELK Stack / CloudWatch)          │
│   ├─ Application Logs               │
│   ├─ Error Logs                     │
│   └─ Audit Logs                     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Log Analysis & Storage            │
│   • Search                          │
│   • Alerting                        │
│   • Dashboards                      │
└─────────────────────────────────────┘
```

### Metrics & Monitoring

```
Application Metrics:
├── Response Times
├── Throughput
├── Error Rates
├── CPU/Memory Usage
├── Database Query Times
└── Cache Hit Rates

Monitoring Tools:
├── Prometheus (Metrics Collection)
├── Grafana (Visualization)
├── DataDog / New Relic (APM)
└── AWS CloudWatch
```

---

## Deployment Topology

### Development Environment (Local)

```
Single Machine:
├── Frontend (Port 3000)
├── BFF (Port 3001)
├── User Service (Port 8081)
├── Product Service (Port 8082)
├── Order Service (Port 8083)
└── Supply Service (Port 8084)

All services in separate processes
H2 databases (in-memory)
```

### Staging Environment (AWS)

```
ECS Cluster:
├── Frontend Task (Fargate)
├── BFF Task (Fargate) - Auto-scaling
├── User Service Task (Fargate)
├── Product Service Task (Fargate)
├── Order Service Task (Fargate)
└── Supply Service Task (Fargate)

RDS:
├── PostgreSQL Instance (userdb)
├── PostgreSQL Instance (productdb)
├── PostgreSQL Instance (orderdb)
└── PostgreSQL Instance (supplierdb)

S3 for static assets
CloudFront CDN
```

### Production Environment (AWS HA)

```
Multiple Availability Zones:

Zone 1:                 Zone 2:                Zone 3:
├─ Frontend           ├─ Frontend            ├─ Frontend
├─ BFF                ├─ BFF                 ├─ BFF
├─ Services           ├─ Services            ├─ Services
└─ Cache              └─ Cache               └─ Cache

ALB (Application Load Balancer)

RDS (Multi-AZ):
├─ Primary DB + Standby
└─ Read Replicas

ElastiCache (Redis Cluster)
S3 + CloudFront
WAF + Shield
```

---

## Technology Decisions & Rationale

| Component | Choice | Reasoning |
|-----------|--------|-----------|
| Frontend Framework | React 18 | Large ecosystem, reusable components, strong community |
| State Management | Redux | Predictable state management, time-travel debugging |
| Routing | React Router v6 | Standard for React, supports lazy loading |
| Backend Framework | Spring Boot | Enterprise-grade, mature, excellent documentation |
| Database | H2 (Dev) / PostgreSQL (Prod) | H2 for quick setup, PostgreSQL for production reliability |
| API Gateway | Custom BFF | Simple architecture, full control, suitable for small team |
| Authentication | JWT | Stateless, scalable, no session management |
| Messaging | REST APIs | Simpler than message queues for MVP, can upgrade later |
| Containerization | Docker | Industry standard, easy deployment |
| Orchestration | Kubernetes (Optional) | Can upgrade from Docker Compose as scales |

---

## Network Architecture

### Service Communication

```
Frontend Request:
Browser → BFF → Microservices → Databases

Frontend to BFF:
└─ HTTP/HTTPS (Port 3001)

BFF to Microservices:
├─ User Service ← Port 8081
├─ Product Service ← Port 8082
├─ Order Service ← Port 8083
└─ Supply Service ← Port 8084

Microservices to Database:
└─ JDBC connections (In-process)
```

### Load Balancing Strategy

```
Frontend:
├─ Served via CDN (CloudFront)
└─ No backend load needed

BFF:
├─ Behind ALB
├─ Sticky sessions not required (stateless)
└─ Auto-scaling group (2-10 instances)

Microservices:
├─ Service mesh (Istio) for routing
├─ Health checks every 10 seconds
└─ Automatic failover
```

---

## Backup & Disaster Recovery

### Backup Strategy

```
Database Backups:
├─ Automated daily snapshots
├─ Point-in-time recovery (30 days)
├─ Cross-region replication
└─ Regular restore testing

Code Backups:
├─ Git repository (multiple remotes)
├─ GitHub Pages for documentation
└─ Release tags for versions
```

### Disaster Recovery Plan

```
RTO: 4 hours
RPO: 1 hour

Failover steps:
1. Promote read replica to primary
2. Update DNS to new endpoint
3. Restore from latest snapshot if needed
4. Verify all services are healthy
5. Notify stakeholders
```

---

**Last Updated**: 2024  
**Version**: 1.0.0
