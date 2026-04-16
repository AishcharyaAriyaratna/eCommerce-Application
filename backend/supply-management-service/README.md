# Supply Management Service - eCommerce Application

## Overview
Spring Boot microservice responsible for supplier operations and product approval workflow.

## Responsibilities
- **Product Addition**: Allow suppliers to add new products
- **Stock Management**: Update product stock counts
- **Product Removal**: Allow suppliers to remove their products
- **Approval Workflow**: Data stewards approve/reject products
- **Supplier Management**: Manage supplier information
- **Product Visibility**: Control product visibility based on approval status

## Architecture
- **Framework**: Spring Boot 3.1
- **Database**: Independent database (separate from other services)
- **ORM**: Spring Data JPA
- **Port**: 8084

## API Endpoints (Placeholder)
- `POST /suppliers/{supplierId}/products` - Add product
- `PUT /suppliers/{supplierId}/products/{productId}` - Update stock
- `DELETE /suppliers/{supplierId}/products/{productId}` - Remove product
- `GET /products/pending-approval` - List pending products (stewards only)
- `POST /products/{productId}/approve` - Approve product (stewards only)
- `POST /products/{productId}/reject` - Reject product (stewards only)
- `GET /suppliers/{supplierId}/products` - Get supplier's products

## Database Schema
- Supplier entity
- Product submissions with approval status
- Approval workflow tracking
- Stock history
- Timestamps

## Setup
```bash
cd backend/supply-management-service
mvn clean install
mvn spring-boot:run
```

## Environment Configuration
Configure database connection and service port in `application.yml`.
