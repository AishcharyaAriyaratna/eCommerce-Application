# Backend Microservices - eCommerce Application

## Overview
Four independent Spring Boot microservices, each with its own database.

## Services

### 1. User Service (Port 8081)
Manages user accounts, profiles, and role assignments.
- User registration and authentication
- Role assignment (Customer, Supplier, Data Steward)
- Profile management
- Cognito integration

### 2. Product Service (Port 8082)
Manages product catalog, categories, and availability.
- Product CRUD operations
- Category management
- Search and browsing
- Approval status tracking
- Inventory display

### 3. Order Service (Port 8083)
Manages shopping carts and orders.
- Cart creation and management
- Add/remove items from cart
- Order processing
- Order history and tracking

### 4. Supply Management Service (Port 8084)
Manages supplier operations and product approval workflow.
- Supplier product submission
- Stock management
- Product approval/rejection workflow
- Supplier dashboard

## Architecture Principles
- **Independent Databases**: Each service owns its data
- **REST APIs**: Standard HTTP/JSON communication
- **No Direct Service-to-Service Calls**: Communication through BFF only (except for specific aggregate operations)
- **Scalability**: Services can be deployed and scaled independently
- **Database Isolation**: No shared databases or direct DB access across services

## Setup
Each service has its own pom.xml and can be built independently:

```bash
cd <service-name>
mvn clean install
mvn spring-boot:run
```

## Common Configuration
- Java 17
- Spring Boot 3.1
- Spring Data JPA
- H2 Database (development)
- RESTful API design

## Database Strategy
- H2 for development (in-memory)
- Production: Migrate to PostgreSQL/MySQL as needed
- Each service: user_db, product_db, order_db, supplier_db

## Testing
Minimum 5 end-to-end test cases for each service covering all major features.
