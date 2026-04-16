# Product Service - eCommerce Application

## Overview
Spring Boot microservice responsible for product catalog management and inventory.

## Responsibilities
- **Product Search & Browsing**: Search products by name, browse by category
- **Product Listing**: Display all products with details (price, supplier info)
- **Product Details**: Return full product information
- **Approval Management**: Handle product approval workflow
- **Inventory Management**: Track product stock levels
- **Category Management**: Organize products by categories

## Architecture
- **Framework**: Spring Boot 3.1
- **Database**: Independent database (separate from other services)
- **ORM**: Spring Data JPA
- **Port**: 8082

## API Endpoints (Placeholder)
- `GET /products` - List all approved products (with search/filter)
- `GET /products/{productId}` - Get product details
- `GET /products/category/{categoryId}` - Browse by category
- `POST /products` - Create product (suppliers only)
- `PUT /products/{productId}` - Update product
- `DELETE /products/{productId}` - Remove product
- `GET /products/{productId}/approval-status` - Check approval status

## Database Schema
- Product entity with approval status
- Categories
- Pricing and inventory information
- Supplier reference
- Timestamps

## Setup
```bash
cd backend/product-service
mvn clean install
mvn spring-boot:run
```

## Environment Configuration
Configure database connection and service port in `application.yml`.
