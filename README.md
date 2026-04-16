# Mini eCommerce Platform

Enterprise-grade eCommerce application demonstrating modern system design, microservices architecture, and best practices.

## Project Overview

This is a reduced-scale version of a real eCommerce platform built with:
- **Micro Frontend Architecture** (React + Single-SPA)
- **Backend for Frontend (BFF)** pattern
- **Microservices** with independent databases
- **AWS Cognito** for authentication and role-based access control
- **Docker & AWS** deployment

## All Actors & Roles

### Customer
- Browse product categories
- Search products
- View product details
- Create and manage cart
- Add/remove products from cart

### Supplier
- Add new products
- Update product stock
- Remove products

### Data Steward
- Approve or reject supplier-added products
- Ensure only approved products are visible to customers

## System Architecture

### Layers
1. **Frontend** (React, Single-SPA) → Port 3000
2. **BFF** (Node.js) → Port 3001
3. **Microservices** (Spring Boot) → Ports 8081-8084
4. **Databases** (Independent per service)
5. **Authentication** (AWS Cognito)

### Directory Structure

```
eCommerce-Application/
├── frontend/                          # React + Single-SPA frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── store/                    # Redux store
│   │   └── public/                   # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── bff/                              # Backend for Frontend
│   ├── src/
│   │   ├── routes/                   # API route handlers
│   │   ├── middleware/               # Authentication, CORS, etc
│   │   └── server.ts                 # Express app entry
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                          # Microservices
│   ├── user-service/                 # User management (Port 8081)
│   ├── product-service/              # Product catalog (Port 8082)
│   ├── order-service/                # Cart & orders (Port 8083)
│   └── supply-management-service/    # Supplier & approval (Port 8084)
│
├── docker/                           # Docker configurations
│   ├── docker-compose.yml            # Orchestrate all services
│   ├── Dockerfile.frontend
│   ├── Dockerfile.bff
│   └── Dockerfile.*-service
│
├── api-specs/                        # OpenAPI/Swagger definitions
├── docs/                             # Documentation
└── projectPlan.md                    # Original project plan
```

## Services Overview

| Service | Port | Responsibility |
|---------|------|-----------------|
| User Service | 8081 | User accounts, profiles, roles |
| Product Service | 8082 | Product catalog, search, browsing |
| Order Service | 8083 | Shopping carts, orders |
| Supply Management | 8084 | Supplier products, approval workflow |

**Important**: Each service has its own independent database.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for Spring Boot services)
- Maven 3.8+

### Using Docker Compose
```bash
# Create .env file with your AWS Cognito credentials
cp .env.example .env

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Services will be available at:
# Frontend: http://localhost:3000
# BFF: http://localhost:3001
# User Service: http://localhost:8081
# Product Service: http://localhost:8082
# Order Service: http://localhost:8083
# Supply Management: http://localhost:8084
```

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**BFF:**
```bash
cd bff
npm install
npm run dev
```

**Backend Services:**
```bash
cd backend/<service-name>
mvn spring-boot:run
```

## API Design
All APIs follow RESTful design principles and are defined using OpenAPI (Swagger). Specifications are stored in `api-specs/`.

## Testing
Minimum 5 end-to-end test cases for each service covering all major features:
- Unit tests for business logic
- Integration tests for service interactions
- Static code analysis

## Security
- Authentication via AWS Cognito
- Role-based access control (RBAC)
- Secure communication over HTTPS
- Input validation and error handling

## Deployment
- Services containerized with Docker
- Orchestrated via Docker Compose (development)
- Deployed to AWS non-production environment
- GitHub for version control
- Feature branch workflow with PR reviews

## Key Design Principles
✓ Independent deployability of services  
✓ No shared databases across services  
✓ Frontend communicates only with BFF  
✓ Each service owns its data  
✓ Scalable microservices architecture  
✓ Clean code and enterprise standards  

## Documentation
- [Project Plan](projectPlan.md) - Original requirements
- [API Specifications](api-specs/) - OpenAPI definitions
- [Service READMEs](backend/) - Individual service documentation

## Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Submit PR with description
4. Code review
5. Merge to `main`
6. Deploy to AWS

---

**Status**: Initial repository structure and configuration setup complete. Ready for development.
