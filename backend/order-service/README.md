# Order Service - eCommerce Application

## Overview
Spring Boot microservice responsible for order management and cart operations.

## Responsibilities
- **Cart Management**: Create and manage customer carts
- **Cart Operations**: Add/remove products from cart
- **Cart View**: Retrieve cart contents
- **Order Processing**: Convert cart to order
- **Order History**: Track customer orders
- **Order Tracking**: Retrieve order status and details

## Architecture
- **Framework**: Spring Boot 3.1
- **Database**: Independent database (separate from other services)
- **ORM**: Spring Data JPA
- **Port**: 8083

## API Endpoints (Placeholder)
- `GET /carts/{userId}` - Get user's cart
- `POST /carts/{userId}` - Create cart
- `POST /carts/{userId}/items` - Add item to cart
- `DELETE /carts/{userId}/items/{itemId}` - Remove item from cart
- `POST /orders` - Create order from cart
- `GET /orders/{orderId}` - Get order details
- `GET /orders/user/{userId}` - Get user's orders

## Database Schema
- Cart entity with status
- Cart items with product references
- Order entity
- Order items
- Order status tracking

## Setup
```bash
cd backend/order-service
mvn clean install
mvn spring-boot:run
```

## Environment Configuration
Configure database connection and service port in `application.yml`.
