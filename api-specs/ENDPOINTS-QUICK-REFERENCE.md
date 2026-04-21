# API Endpoints Quick Reference

## User Service (Port 8081)

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| GET | `/api/users` | List all users (paginated) | JWT, DATA_STEWARD |
| POST | `/api/users` | Create new user | JWT, DATA_STEWARD |
| GET | `/api/users/{id}` | Get user by ID | JWT |
| PUT | `/api/users/{id}` | Update user details | JWT, DATA_STEWARD |
| DELETE | `/api/users/{id}` | Delete user | JWT, DATA_STEWARD |
| GET | `/api/users/username/{username}` | Get user by username | JWT |
| PATCH | `/api/users/{id}/status` | Update user status (ACTIVE/INACTIVE/SUSPENDED) | JWT, DATA_STEWARD |
| PATCH | `/api/users/{id}/role` | Assign role (CUSTOMER/SUPPLIER/DATA_STEWARD) | JWT, DATA_STEWARD |

---

## Product Service (Port 8082)

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| GET | `/api/products` | List all products (paginated) | JWT |
| POST | `/api/products` | Create new product | JWT, SUPPLIER |
| GET | `/api/products/{id}` | Get product by ID | JWT |
| DELETE | `/api/products/{id}` | Delete product | JWT, DATA_STEWARD |
| POST | `/api/products/{id}/approve` | Approve pending product (PENDING→APPROVED) | JWT, DATA_STEWARD |
| POST | `/api/products/{id}/reject` | Reject pending product (PENDING→REJECTED) | JWT, DATA_STEWARD |
| GET | `/api/products/category/{category}` | Filter products by category | JWT |
| GET | `/api/products/search?name=...` | Search products by name | JWT |
| GET | `/api/products/supplier/{supplierId}` | List supplier's products | JWT |
| GET | `/api/products/status/pending` | List pending approval products | JWT, DATA_STEWARD |
| PATCH | `/api/products/{id}/stock` | Update product stock quantity | JWT, SUPPLIER |

---

## Order Service (Port 8083)

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| GET | `/api/orders` | List all orders (paginated) | JWT |
| POST | `/api/orders` | Create new order (status=PENDING) | JWT, CUSTOMER |
| GET | `/api/orders/{id}` | Get order by ID | JWT |
| DELETE | `/api/orders/{id}` | Delete order | JWT, DATA_STEWARD |
| GET | `/api/orders/number/{orderNumber}` | Get order by order number | JWT |
| GET | `/api/orders/customer/{customerId}` | List customer's orders | JWT |
| POST | `/api/orders/{id}/items` | Add items to pending order | JWT, CUSTOMER |
| DELETE | `/api/orders/{orderId}/items/{itemId}` | Remove item from pending order | JWT, CUSTOMER |
| PATCH | `/api/orders/{id}/confirm` | Confirm order (PENDING→CONFIRMED, lock items) | JWT, CUSTOMER |
| PATCH | `/api/orders/{id}/ship` | Ship order (CONFIRMED→SHIPPED) | JWT, DATA_STEWARD |
| PATCH | `/api/orders/{id}/deliver` | Deliver order (SHIPPED→DELIVERED) | JWT, DATA_STEWARD |
| PATCH | `/api/orders/{id}/cancel` | Cancel order (PENDING→CANCELLED, customer or admin) | JWT |

---

## Supply Management Service (Port 8084)

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| GET | `/api/suppliers` | List all suppliers (paginated) | JWT |
| POST | `/api/suppliers` | Register new supplier (status=PENDING) | JWT |
| GET | `/api/suppliers/{id}` | Get supplier by ID | JWT |
| PUT | `/api/suppliers/{id}` | Update supplier info | JWT, (SUPPLIER or DATA_STEWARD) |
| DELETE | `/api/suppliers/{id}` | Delete supplier | JWT, DATA_STEWARD |
| POST | `/api/suppliers/{id}/approve` | Approve supplier (PENDING→APPROVED) | JWT, DATA_STEWARD |
| POST | `/api/suppliers/{id}/reject` | Reject supplier (PENDING→REJECTED) | JWT, DATA_STEWARD |
| PATCH | `/api/suppliers/{id}/suspend` | Suspend supplier (APPROVED→SUSPENDED) | JWT, DATA_STEWARD |
| PATCH | `/api/suppliers/{id}/activate` | Reactivate supplier (SUSPENDED→APPROVED) | JWT, DATA_STEWARD |
| GET | `/api/suppliers/name/{name}` | Search suppliers by name | JWT |
| GET | `/api/suppliers/email/{email}` | Get supplier by email | JWT |
| GET | `/api/suppliers/status/active` | List active suppliers | JWT |
| GET | `/api/suppliers/status/pending` | List pending approval suppliers | JWT, DATA_STEWARD |
| GET | `/api/suppliers/country/{country}` | Filter suppliers by country | JWT |

---

## Authentication & Security

### Bearer JWT Token
- **Header**: `Authorization: Bearer <token>`
- **Issued by**: Authentication service (BFF) at `http://localhost:3001/auth/login`
- **Expiry**: 1 hour
- **Algorithm**: HS256

### Test Users (from BFF)
```
Username: customer1   | Password: pass123 | Role: CUSTOMER
Username: supplier1   | Password: pass123 | Role: SUPPLIER
Username: admin1      | Password: pass123 | Role: DATA_STEWARD
```

### Role-Based Access Control
- **CUSTOMER**: Can create/manage own orders, browse products
- **SUPPLIER**: Can register, create/manage products, view product catalog
- **DATA_STEWARD**: Can approve/reject products & suppliers, manage users, suspend suppliers

---

## Standard HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request succeeded | GET /api/users/1 |
| 201 | Created - Resource created | POST /api/users |
| 204 | No Content - Success with no response body | DELETE /api/users/1 |
| 400 | Bad Request - Invalid parameters | POST invalid JSON |
| 401 | Unauthorized - No/invalid token | Missing Bearer token |
| 403 | Forbidden - Insufficient privileges | CUSTOMER tries to approve product |
| 404 | Not Found - Resource doesn't exist | GET /api/users/99999 |
| 409 | Conflict - Resource already exists | Register duplicate email |

---

## Common Request Examples

### Login (BFF)
```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "username": "customer1",
  "password": "pass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "customer1",
    "role": "CUSTOMER"
  }
}
```

### Create User (Data Steward only)
```bash
POST http://localhost:8081/api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
```

### Create Product (Supplier)
```bash
POST http://localhost:8082/api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop Pro 15",
  "description": "High-performance laptop",
  "category": "Electronics",
  "price": 999.99,
  "stock": 50
}
```

### Create Order (Customer)
```bash
POST http://localhost:8083/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1
}
```

### Add Items to Order (Customer)
```bash
POST http://localhost:8083/api/orders/1/items
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "productId": 1,
    "quantity": 2
  },
  {
    "productId": 2,
    "quantity": 1
  }
]
```

### Register Supplier
```bash
POST http://localhost:8084/api/suppliers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechSupply Corp",
  "email": "contact@techsupply.com",
  "phone": "+1-555-0100",
  "address": "123 Tech Street",
  "city": "San Francisco",
  "country": "USA",
  "taxId": "12-3456789"
}
```

---

## API Workflow Examples

### Create and Confirm Order
1. **Login**: `POST /auth/login` → Get JWT token
2. **Create Order**: `POST /api/orders` (status=PENDING)
3. **Add Items**: `POST /api/orders/{id}/items` with productId & quantity
4. **Remove Item** (optional): `DELETE /api/orders/{orderId}/items/{itemId}`
5. **Confirm Order**: `PATCH /api/orders/{id}/confirm` (status=CONFIRMED, items locked)
6. **Ship Order** (admin): `PATCH /api/orders/{id}/ship` (status=SHIPPED)
7. **Deliver Order** (admin): `PATCH /api/orders/{id}/deliver` (status=DELIVERED)

### Supplier Registration & Approval
1. **Register**: `POST /api/suppliers` (status=PENDING)
2. **Admin Reviews**: `GET /api/suppliers/status/pending`
3. **Approve**: `POST /api/suppliers/{id}/approve` (status=APPROVED)
4. OR **Reject**: `POST /api/suppliers/{id}/reject` (status=REJECTED)
5. **Later Suspend** (if needed): `PATCH /api/suppliers/{id}/suspend`

### Product Catalog Workflow
1. **Create Product** (supplier): `POST /api/products` (status=PENDING)
2. **Admin Reviews**: `GET /api/products/status/pending`
3. **Approve**: `POST /api/products/{id}/approve` (status=APPROVED, now visible)
4. OR **Reject**: `POST /api/products/{id}/reject` (status=REJECTED)
5. **Manage Stock** (supplier): `PATCH /api/products/{id}/stock`
6. **Customer Searches**: `GET /api/products/search?name=...`

---

## Service Interdependencies

```
User Service (8081)        [Manages users, roles, permissions]
             ↓
Product Service (8082)     [Uses user IDs for supplier/approver tracking]
             ↓
Order Service (8083)       [References user IDs (customers) & product IDs]
             ↓
Supply Management (8084)   [Manages suppliers, references users & products]
```

**NOTE:** Services are independent. No inter-service API calls. Each service maintains its own data.

---

## Performance Notes

- **List endpoints** support pagination: `?page=0&size=20`
- **Search endpoints** filter by name/email with wildcards
- **H2 in-memory databases** used (development only, data lost on restart)
- **JWT tokens** expire after 1 hour
- **No rate limiting** currently implemented

---

**Last Updated:** April 2026  
**OpenAPI Version:** 3.0.0  
**Status:** Ready for Development
