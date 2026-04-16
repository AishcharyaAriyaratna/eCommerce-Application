# Frontend - eCommerce Application

## Overview
React-based frontend with Single-SPA for micro-frontend architecture.

## Responsibilities
- **User Authentication**: Login/logout with AWS Cognito
- **Product Listing & Search**: Browse and search products
- **Product Details View**: Display full product information
- **Cart Management**: Add/remove items, view cart
- **Supplier Dashboard**: Manage products and inventory (suppliers only)
- **Data Steward Dashboard**: Approve/reject products (data stewards only)

## Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: Redux
- **Routing**: React Router v6
- **Micro-frontend**: Single-SPA for module federation
- **API Communication**: Axios (communicates with BFF only)

## Key Features
- Role-based UI rendering (Customer, Supplier, Data Steward)
- Redux store for state management
- Single-SPA for independent application shells
- Responsive component structure

## Setup
```bash
npm install
npm start
```

## Environment Variables
See `.env.example` - Configure BFF endpoint, Cognito settings, and region.
