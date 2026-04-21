# eCommerce Application - Complete Documentation Index

A comprehensive guide to the Mini eCommerce Platform with microservices architecture.

---

## 📚 Documentation Overview

This project is extensively documented. Here's a quick guide to find what you need:

### 🚀 Getting Started
Start here if you're new to the project:
1. **[QUICK_START.md](./QUICK_START.md)** - How to run the application
   - Prerequisites & installation
   - Starting all services
   - Accessing the frontend & APIs
   - Test users & credentials
   - Troubleshooting

2. **[projectplan.md](./projectplan.md)** - Original project plan
   - Project objectives
   - Functional requirements
   - Actor roles & capabilities
   - System architecture overview

### 👨‍💻 Development Guide
For developers working on features and fixes:
1. **[DEVELOPERS_GUIDE.md](./DEVELOPERS_GUIDE.md)** - Complete development guide
   - Architecture deep-dive
   - Frontend development guide
   - Backend service development
   - BFF development
   - Database design
   - Authentication system
   - API integration patterns
   - Testing strategies
   - Deployment procedures
   - Common task examples

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & design
   - Component interaction flows
   - Data flow diagrams
   - Database schemas
   - Security architecture
   - Performance considerations
   - Scalability design
   - Monitoring & observability
   - Deployment topologies

### 🔍 Implementation Status
Track the project progress:
1. **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Detailed status report
   - Phase completion status
   - Microservice details
   - Feature implementation checklist
   - Component breakdown
   - Testing status
   - Known limitations

2. **[LOCAL_AUTH_IMPLEMENTATION.md](./LOCAL_AUTH_IMPLEMENTATION.md)** - Authentication details
   - JWT token system
   - Local authentication (no AWS Cognito needed)
   - Test user setup
   - Token validation process

### 🏃 Running & Operations
For running and managing the application:
1. **[RUN_SERVICES.md](./RUN_SERVICES.md)** - Detailed service startup guide
   - Individual service startup
   - Batch startup scripts
   - Port assignments
   - Service status verification
   - Log locations

### 📡 API Documentation
1. **[api-specs/](./api-specs/)** - OpenAPI specifications
   - Endpoint definitions
   - Request/response models
   - Authentication requirements
   - Error codes

---

## 🏗️ Project Structure

```
eCommerce-Application/
│
├── 📁 frontend/                    React frontend application
│   ├── src/
│   │   ├── components/             Reusable React components
│   │   ├── pages/                  Full page components
│   │   ├── store/
│   │   │   └── slices/            Redux state slices
│   │   ├── services/              API services
│   │   ├── App.js                 Main app & routing
│   │   └── index.js               Entry point
│   └── package.json
│
├── 📁 bff/                         Backend For Frontend (Node.js)
│   ├── routes/                    Express route definitions
│   ├── middleware/                Custom middleware
│   ├── config/                    Configuration
│   ├── app.js                     Express app
│   ├── server.js                  Server startup
│   └── package.json
│
├── 📁 backend/                     Spring Boot microservices
│   ├── user-service/              User management service
│   ├── product-service/           Product catalog service
│   ├── order-service/             Order management service
│   └── supply-management-service/ Supplier management service
│
├── 📁 docker/                      Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.bff
│   ├── Dockerfile.services
│   └── docker-compose.yml
│
├── 📁 docs/                        Additional documentation
│   ├── diagrams/
│   ├── api-examples/
│   └── troubleshooting/
│
├── 📁 api-specs/                   OpenAPI specifications
│   ├── users-api.yaml
│   ├── products-api.yaml
│   ├── orders-api.yaml
│   └── suppliers-api.yaml
│
├── 📄 projectplan.md               Original project plan
├── 📄 QUICK_START.md              Quick startup guide
├── 📄 DEVELOPERS_GUIDE.md         Complete dev guide
├── 📄 IMPLEMENTATION_STATUS.md    Status report
├── 📄 ARCHITECTURE.md             Architecture guide
├── 📄 LOCAL_AUTH_IMPLEMENTATION.md Auth system details
├── 📄 RUN_SERVICES.md             Service startup guide
├── 📄 README.md                   Project overview
│
└── 🔧 Batch scripts for Windows
    ├── run-all-services.bat       Start all services
    └── run-all-services-jar.bat   Start using JAR files
```

---

## 🎯 Quick Navigation by Role

### For Frontend Developers
```
Start with:
1. QUICK_START.md - Get running
2. DEVELOPERS_GUIDE.md #2 (Frontend Section) - Learn structure
3. ARCHITECTURE.md - Understand system

Key files to review:
- frontend/src/components/Navigation.js
- frontend/src/store/slices/
- frontend/src/services/apiService.js
- frontend/src/App.js (routing)
```

### For Backend Developers
```
Start with:
1. QUICK_START.md - Get running
2. DEVELOPERS_GUIDE.md #3 (Backend Section) - Service patterns
3. ARCHITECTURE.md - Component interactions
4. backend/[service]/README.md - Service-specific docs

Key files to review:
- backend/[service]/src/controller/
- backend/[service]/src/service/
- backend/[service]/pom.xml
- backend/[service]/src/main/resources/application.properties
```

### For DevOps/Infrastructure
```
Start with:
1. ARCHITECTURE.md - Full architecture
2. docker/ - Containerization configs
3. RUN_SERVICES.md - Service management
4. QUICK_START.md - Local setup

Key areas:
- Docker images & tags
- Port mappings
- Environment variables
- Database initialization
- Health checks
```

### For QA/Testing
```
Start with:
1. IMPLEMENTATION_STATUS.md - What's available to test
2. QUICK_START.md - How to run
3. api-specs/ - API definitions
4. DEVELOPERS_GUIDE.md #8 (Testing) - Test strategies

Test users available:
- customer1, customer2 (browse & purchase)
- supplier1, supplier2 (manage products)
- datasteward1, datasteward2 (approve products)
```

### For Project Managers
```
Overview section:
1. projectplan.md - Original scope
2. IMPLEMENTATION_STATUS.md - Progress tracking
3. README.md - High-level overview

Status tracking:
- Frontend: ✅ 100% Complete
- Backend Services: ✅ 100% Complete
- BFF: ✅ 100% Complete
- Testing: ⏳ In Progress
- Deployment: ⏳ Pending
```

---

## 🔑 Key Information

### System URLs

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| BFF | http://localhost:3001 | API gateway |
| API Docs | http://localhost:3001/api-docs | API documentation |
| User Service | http://localhost:8081 | User management microservice |
| Product Service | http://localhost:8082 | Product management microservice |
| Order Service | http://localhost:8083 | Order management microservice |
| Supply Service | http://localhost:8084 | Supplier management microservice |
| H2 User DB | http://localhost:8081/h2-console | User database console |
| H2 Product DB | http://localhost:8082/h2-console | Product database console |
| H2 Order DB | http://localhost:8083/h2-console | Order database console |
| H2 Supply DB | http://localhost:8084/h2-console | Supply database console |

### Test Credentials

All passwords are: `password123`

| Username | Role | Use Case |
|----------|------|----------|
| customer1 | CUSTOMER | Browse products, cart, orders |
| customer2 | CUSTOMER | Alternative customer user |
| supplier1 | SUPPLIER | Add/manage products |
| supplier2 | SUPPLIER | Alternative supplier user |
| datasteward1 | DATA_STEWARD | Approve/reject products |
| datasteward2 | DATA_STEWARD | Alternative admin user |

### Port Assignments

| Port | Service | Status |
|------|---------|--------|
| 3000 | Frontend (React) | Development |
| 3001 | BFF (Node.js) | Development |
| 8081 | User Service | Microservice |
| 8082 | Product Service | Microservice |
| 8083 | Order Service | Microservice |
| 8084 | Supply Management | Microservice |

---

## 🛠️ Common Tasks

### Starting Development

```bash
# Terminal 1: Start BFF
cd bff && npm install && npm start

# Terminal 2: Start Frontend  
cd frontend && npm install && npm start

# Terminal 3-6: Start Backend Services (or use batch scripts)
# See QUICK_START.md for complete instructions
```

### Adding a New API Endpoint

1. **Decide which service** owns the business logic
2. **Create in Backend Service**:
   - Entity (if new data)
   - Repository
   - Service class
   - Controller with endpoint
3. **Create in BFF**:
   - Route that forwards to backend service
4. **Create in Frontend**:
   - Component/page that calls the endpoint
   - Redux slice if managing state
5. **Test** through frontend UI

### Testing Your Changes

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend/[service-name] && mvn test

# Integration test: Use the UI directly
# Or use curl/Postman with JWT token
```

### Deploying to AWS

1. Build Docker images
2. Push to ECR
3. Update ECS task definitions
4. Deploy through CloudFormation/Terraform
5. Verify health checks
6. Run smoke tests

See **DEVELOPERS_GUIDE.md #9** for detailed steps.

---

## 📊 Technology Stack Summary

### Frontend
- **Framework**: React 18.2
- **Language**: JavaScript & TypeScript
- **State**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP**: Axios
- **Build**: Create React App
- **Package Manager**: npm

### Backend for Frontend
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Authentication**: jsonwebtoken (JWT)
- **HTTP Client**: Axios
- **Package Manager**: npm

### Microservices
- **Framework**: Spring Boot 2.7+
- **Language**: Java 11+
- **ORM**: Spring Data JPA
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Security**: Spring Security
- **Build**: Maven

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev) / Kubernetes (prod)
- **Cloud**: AWS (ECS, RDS, S3, CloudFront)
- **Version Control**: Git/GitHub

---

## 📖 Document Purposes

| Document | Purpose | Audience |
|----------|---------|----------|
| projectplan.md | Original requirements & architecture | Everyone |
| QUICK_START.md | Fast setup guide | All developers |
| DEVELOPERS_GUIDE.md | Complete development reference | Engineers |
| ARCHITECTURE.md | System design & scalability | Architects, engineers |
| IMPLEMENTATION_STATUS.md | Progress tracking | Project managers, leads |
| LOCAL_AUTH_IMPLEMENTATION.md | Authentication details | Backend engineers |
| RUN_SERVICES.md | Service startup guide | DevOps, engineers |
| This guide | Documentation index | Everyone |

---

## ✅ Verification Checklist

After starting the application, verify:

- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with customer1 / password123
- [ ] Dashboard displays based on user role
- [ ] Can browse products
- [ ] Can add products to cart
- [ ] BFF API responds at http://localhost:3001/api
- [ ] User Service at http://localhost:8081
- [ ] Product Service at http://localhost:8082
- [ ] Order Service at http://localhost:8083
- [ ] Supply Service at http://localhost:8084
- [ ] H2 console accessible for at least one service
- [ ] Can logout successfully
- [ ] Different users see different menu items

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process using port (see QUICK_START.md) |
| Frontend can't reach BFF | Ensure BFF running on 3001, check CORS |
| Login fails | Verify user exists, password is 'password123' |
| Services not starting | Check Java/Maven installed, try 'mvn clean install' |
| Database errors | H2 is in-memory, data lost on restart (expected) |
| CORS errors | Check BFF CORS configuration for frontend origin |
| 401 Unauthorized | Token expired or invalid, logout and login again |

---

## 🔄 Project Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Project planning
- [x] Architecture design
- [x] Technology selection
- [x] Microservice setup
- [x] BFF implementation
- [x] Frontend scaffolding
- [x] Local authentication

### Phase 2: Feature Implementation ✅ COMPLETE
- [x] User management service
- [x] Product catalog service
- [x] Order management service
- [x] Supplier management service
- [x] Frontend components
- [x] Cart functionality
- [x] Product approval workflow

### Phase 3: Testing & Refinement 🔄 IN PROGRESS
- [ ] Unit test coverage
- [ ] Integration test suite
- [ ] E2E test scenarios
- [ ] Performance testing
- [ ] Security testing
- [ ] Bug fixes & refinement

### Phase 4: Deployment 📅 UPCOMING
- [ ] Docker containerization
- [ ] Container registry setup
- [ ] AWS infrastructure
- [ ] CI/CD pipeline
- [ ] Post-deployment validation
- [ ] Production monitoring

---

## 📞 Support & Contribution

### Getting Help
1. Check the relevant documentation above
2. Search existing issues on GitHub
3. Review error messages in logs
4. Consult the development team

### Contributing
1. Create feature branch from `develop`
2. Make changes following the codebase patterns
3. Run tests locally
4. Submit pull request with description
5. Request code review

### Reporting Issues
1. Test with latest code
2. Include steps to reproduce
3. Share error logs
4. Specify environment (OS, versions)
5. Create GitHub issue with details

---

## 📝 Documentation Updates

This documentation was last updated for:
- **Frontend**: React 18.2 with TypeScript
- **Backend**: Spring Boot 2.7+ with Java 11
- **BFF**: Node.js with Express.js
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Deployment**: Docker & AWS

For specific version details, check individual `README.md` files in each service directory.

---

## 🎓 Learning Resources

### For Understanding Microservices
- [Microservices Pattern](https://microservices.io/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Express.js Guide](https://expressjs.com/)

### For Frontend Development
- [React Documentation](https://react.dev)
- [Redux Documentation](https://redux.js.org/)
- [React Router Documentation](https://reactrouter.com/)

### For Architecture
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [The Twelve-Factor App](https://12factor.net/)

---

## 📄 Quick Links

- **GitHub Repository**: See `.git` folder
- **Project Board**: Check GitHub Projects
- **Issues Tracker**: GitHub Issues
- **API Specifications**: [api-specs/](./api-specs/)
- **Docker Configuration**: [docker/](./docker/)
- **Documentation Folder**: [docs/](./docs/)

---

**Status**: ✅ Phase 1 & 2 Complete - Ready for Testing  
**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained By**: Development Team

---

*Welcome to the eCommerce Platform! Start with [QUICK_START.md](./QUICK_START.md) to get up and running in minutes.*
