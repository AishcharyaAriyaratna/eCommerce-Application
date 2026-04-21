# OpenAPI Specification Guide

## Overview

This directory contains OpenAPI 3.0 specifications for all 4 eCommerce microservices. Each service has its own specification file that documents all REST endpoints, request/response schemas, security requirements, and error codes.

**Files:**
- `user-service-openapi.yaml` - User management service
- `product-service-openapi.yaml` - Product catalog service
- `order-service-openapi.yaml` - Order management service
- `supply-management-service-openapi.yaml` - Supplier management service

## What's in Each Spec

Each OpenAPI specification includes:

1. **Service Metadata** - Title, description, version, contact info
2. **Server URLs** - Development server endpoints
3. **Paths** - All REST endpoints with HTTP methods
4. **Operations** - Request/response details for each endpoint
5. **Schemas** - Data model definitions (DTOs, requests)
6. **Security** - JWT Bearer token requirements
7. **Responses** - Standard error codes (401, 403, 404, etc.)

### REST API Standards Followed

- **GET** - Retrieve resources (idempotent, cacheable)
- **POST** - Create new resources
- **PUT** - Full update of existing resources
- **PATCH** - Partial updates (status, role, stock changes)
- **DELETE** - Remove resources
- HTTP status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict)

## Validation Methods

### Method 1: Online Swagger Editor (Easiest)

1. Open **Swagger Editor**: https://editor.swagger.io/
2. Select **File** → **Import File**
3. Choose any `*-openapi.yaml` file from this directory
4. The editor validates automatically and shows any errors in red

**What to look for:**
- No red error indicators (left side)
- All endpoints appear under "Paths" section
- Schema definitions expand without errors
- Security section shows "Bearer (JWT)"

### Method 2: Online Validator (Quick Check)

1. Open **Swagger Validator**: https://swagger.io/tools/swagger-editor/
2. Paste entire YAML content from any spec file
3. Check for validation warnings/errors

### Method 3: Local Validation (Command Line)

If you have Node.js installed:

```bash
# Install validator globally
npm install -g swagger-cli

# Validate a spec file
swagger-cli validate api-specs/user-service-openapi.yaml
swagger-cli validate api-specs/product-service-openapi.yaml
swagger-cli validate api-specs/order-service-openapi.yaml
swagger-cli validate api-specs/supply-management-service-openapi.yaml
```

Or using OpenAPI Generator:

```bash
# Install generator
npm install -g @openapitools/openapi-generator-cli

# Validate
openapi-generator-cli validate -i api-specs/user-service-openapi.yaml
```

### Method 4: YAML Syntax Check

Just verify the file is valid YAML (not OpenAPI-specific):

```bash
# Using Python (if installed)
python -m yaml api-specs/user-service-openapi.yaml

# Or online at: http://www.yamllint.com/
```

## Review Checklist

When reviewing the specifications, verify:

### Completeness
- [ ] All endpoints from project plan are documented
- [ ] All request/response schemas are defined
- [ ] All error scenarios are documented (401, 403, 404)
- [ ] Authentication requirements are clear (Bearer JWT)

### Consistency
- [ ] Similar endpoints follow same pattern (all list endpoints have pagination)
- [ ] Status codes are consistent (201 for creates, 204 for deletes)
- [ ] Error schema is reused consistently
- [ ] Role requirements are documented (e.g., "@PreAuthorize('hasRole(DATA_STEWARD)')")

### API Design
- [ ] Path naming is RESTful (nouns, not verbs)
  - ✅ Good: `POST /api/products/{id}/approve`
  - ❌ Bad: `POST /api/approveProduct`
- [ ] HTTP methods match operation semantics
  - ✅ GET = retrieve, POST = create, PATCH = update, DELETE = remove
- [ ] Resource relationships are clear
  - Example: `/api/orders/{id}/items/{itemId}` shows item belongs to order

### Security
- [ ] All endpoints require Bearer authentication
- [ ] Role-based access is documented (DATA_STEWARD, SUPPLIER, CUSTOMER)
- [ ] Authorization errors return 403 (Forbidden)
- [ ] Authentication errors return 401 (Unauthorized)

### Schemas & Validation
- [ ] Required fields are marked (e.g., `required: [username, email]`)
- [ ] Data types are specific (not just `type: object`)
- [ ] Constraints are defined (minLength, maxLength, minimum, enum values)
- [ ] Examples are provided for clarity
- [ ] DTOs use consistent naming (e.g., CreateUserRequest, UserDTO)

## Visualizing the Specs

### Interactive Swagger UI

To view specs with interactive documentation:

#### Option 1: Using SwaggerHub (Free, Online)

1. Go to https://app.swaggerhub.com/
2. Sign up (free account)
3. Click **Create API**
4. Paste content of any `*-openapi.yaml` file
5. View interactive documentation with **Swagger UI**

#### Option 2: Deploy Swagger UI Locally

If you want to run Swagger UI on your machine:

```bash
# Using Docker (if installed)
docker pull swaggerapi/swagger-ui
docker run -p 8888:8080 -e URLS='[{url:"file:///api/user-service-openapi.yaml", name:"User Service"}]' swaggerapi/swagger-ui

# Visit http://localhost:8888
```

#### Option 3: Simple Node.js Server

Create a `serve-swagger.js` file:

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
const port = 8888;

// Serve all specs
const userSpec = yaml.load(fs.readFileSync('./api-specs/user-service-openapi.yaml', 'utf8'));
const productSpec = yaml.load(fs.readFileSync('./api-specs/product-service-openapi.yaml', 'utf8'));
const orderSpec = yaml.load(fs.readFileSync('./api-specs/order-service-openapi.yaml', 'utf8'));
const supplierSpec = yaml.load(fs.readFileSync('./api-specs/supply-management-service-openapi.yaml', 'utf8'));

app.use('/user-api', swaggerUi.serve, swaggerUi.setup(userSpec));
app.use('/product-api', swaggerUi.serve, swaggerUi.setup(productSpec));
app.use('/order-api', swaggerUi.serve, swaggerUi.setup(orderSpec));
app.use('/supplier-api', swaggerUi.serve, swaggerUi.setup(supplierSpec));

app.listen(port, () => console.log(`Swagger UI running at http://localhost:${port}`));
```

Then:
```bash
npm install express swagger-ui-express js-yaml
node serve-swagger.js
```

Visit:
- http://localhost:8888/user-api
- http://localhost:8888/product-api
- http://localhost:8888/order-api
- http://localhost:8888/supplier-api

## Mapping to Actual Implementation

### User Service (Port 8081)

| OpenAPI Endpoint | Implementation | Controller Method |
|------------------|-----------------|-------------------|
| GET /api/users | List all users with pagination | UserController.getAllUsers() |
| POST /api/users | Create new user | UserController.createUser() |
| GET /api/users/{id} | Fetch one user | UserController.getUserById() |
| GET /api/users/username/{username} | Find by username | UserController.getUserByUsername() |
| PUT /api/users/{id} | Update user details | UserController.updateUser() |
| DELETE /api/users/{id} | Remove user | UserController.deleteUser() |
| PATCH /api/users/{id}/status | Change status | UserController.updateUserStatus() |
| PATCH /api/users/{id}/role | Assign role | UserController.updateUserRole() |

### Product Service (Port 8082)

| OpenAPI Endpoint | Implementation | Description |
|------------------|-----------------|-------------|
| GET /api/products | All products | List approved products |
| POST /api/products | Create product | Supplier creates (status=PENDING) |
| GET /api/products/status/pending | Pending products | Admin approval queue |
| POST /api/products/{id}/approve | Approve | Change PENDING→APPROVED |
| POST /api/products/{id}/reject | Reject | Change PENDING→REJECTED |
| PATCH /api/products/{id}/stock | Update inventory | Supplier updates quantity |

### Order Service (Port 8083)

| OpenAPI Endpoint | Implementation | Workflow |
|------------------|-----------------|----------|
| POST /api/orders | New order | Create with status=PENDING |
| POST /api/orders/{id}/items | Add line items | Can only add to PENDING orders |
| PATCH /api/orders/{id}/confirm | Confirm order | PENDING→CONFIRMED (lock items) |
| PATCH /api/orders/{id}/ship | Ship | CONFIRMED→SHIPPED |
| PATCH /api/orders/{id}/deliver | Deliver | SHIPPED→DELIVERED |
| PATCH /api/orders/{id}/cancel | Cancel | PENDING→CANCELLED |

### Supply Management Service (Port 8084)

| OpenAPI Endpoint | Implementation | Description |
|------------------|-----------------|-------------|
| POST /api/suppliers | Register | Create with status=PENDING |
| GET /api/suppliers/status/pending | Pending suppliers | Admin approval queue |
| POST /api/suppliers/{id}/approve | Approve | PENDING→APPROVED |
| POST /api/suppliers/{id}/reject | Reject | PENDING→REJECTED |
| PATCH /api/suppliers/{id}/suspend | Suspend | APPROVED→SUSPENDED |
| PATCH /api/suppliers/{id}/activate | Reactivate | SUSPENDED→APPROVED |

## Testing Against Running Services

Once services are running, test endpoints:

### Using curl

```bash
# Get JWT token (from BFF at port 3001)
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass123"}' | jq -r '.accessToken')

# Test endpoint with token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/users

# Test user service
curl -H "Authorization: Bearer $TOKEN" http://localhost:8082/api/products

# Test order service
curl -H "Authorization: Bearer $TOKEN" http://localhost:8083/api/orders

# Test supplier service
curl -H "Authorization: Bearer $TOKEN" http://localhost:8084/api/suppliers
```

### Using Postman

1. Import spec into Postman: **File** → **Import** → Select YAML file
2. Postman auto-generates **Collections** from OpenAPI specs
3. Set Bearer token in **Authorization** tab
4. Execute requests and compare actual vs. spec-documented responses

## Common Issues & Fixes

### Issue: "Invalid OpenAPI format"

**Check:**
- File uses 2-space indentation (not tabs)
- No syntax errors (use http://yamllint.com/)
- Version is `3.0.0` not `2.0`
- IndentationError usually indicated by red line

**Fix:** Ensure YAML syntax is valid

### Issue: "Schema not found in components"

**Check:**
- All `$ref: '#/components/schemas/UserDTO'` references exist
- Schema names are spelled correctly
- Schema is under `components: schemas:`

**Fix:** Add missing schema definition

### Issue: "Endpoint undocumented"

**Check:**
- All implemented endpoints are under `paths:`
- Method is correct (GET, POST, PATCH, etc.)
- Parameters match implementation

**Fix:** Add missing endpoint to spec

## Next Steps

1. ✅ Validate all specs (use online Swagger Editor)
2. ✅ Share specs with team via SwaggerHub or Swagger UI
3. ✅ Generate client SDKs (Java, Python, TypeScript)
4. ✅ Generate server stubs (Java, Node.js, Python)
5. ✅ Test endpoints against running services
6. ✅ Update specs if implementation changes

## File Locations

```
ecommerce-app/
├── api-specs/                              (This directory)
│   ├── user-service-openapi.yaml
│   ├── product-service-openapi.yaml
│   ├── order-service-openapi.yaml
│   ├── supply-management-service-openapi.yaml
│   └── API-VALIDATION-GUIDE.md             (This file)
│
├── backend/
│   ├── user-service/                       (Implements user-service-openapi.yaml)
│   ├── product-service/                    (Implements product-service-openapi.yaml)
│   ├── order-service/                      (Implements order-service-openapi.yaml)
│   └── supply-management-service/          (Implements supply-management-service-openapi.yaml)
│
└── frontend/
    └── src/                                (Uses BFF at port 3001 for API calls)
```

## Resources

- **OpenAPI Specification**: https://spec.openapis.org/oas/v3.0.3
- **Swagger Editor**: https://editor.swagger.io/
- **Swagger Tools**: https://swagger.io/tools/
- **OpenAPI Validator**: https://command-line-interface.swagger.io/
- **Postman**: https://www.postman.com/
- **Swagger Hub**: https://swaggerhub.com/

---

**Last Updated:** April 2026  
**Status:** Complete - All 4 services documented
