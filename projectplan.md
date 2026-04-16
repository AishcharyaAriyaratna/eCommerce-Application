PROJECT PLAN

Mini eCommerce Platform

1. Introduction
This project is a Mini eCommerce Platform developed to gain hands on experience in:
•	System design
•	Frontend and backend development
•	Microservices and BFF architecture
•	Authentication integration
•	Clean coding and best practices
The system implements a reduced scale version of a real eCommerce platform while adhering to enterprise development standards.

2. Actors & Roles
2.1 Customer
•	Browse product categories
•	Search products
•	View product details
•	Create and manage a cart
•	Add / remove products from cart
2.2 Supplier
•	Add new products
•	Update product stock
•	Remove products
2.3 Data Steward
•	Approve or reject supplier added products
•	Ensure only approved products are visible to customers

3. Functional Requirements
3.1 Customer Capabilities
•	Access platform via a web browser
•	View home page with product categories
•	Search products by name
•	Browse products by category
•	View product details (price, supplier info, etc.)
•	Create a cart (single cart per user)
•	Add products to cart
•	View cart
•	Remove products from cart
3.2 Supplier Capabilities
•	Add products
•	Update stock counts
•	Remove products
3.3 Data Steward Capabilities
•	Approve or reject products added by suppliers
•	Only approved products are available to customers

4. System Architecture
4.1 High Level Architecture
The system follows a Micro Frontend + Microservices architecture with a Backend for Frontend (BFF) layer.
Layers:
•	Frontend (React, Single SPA)
•	BFF (Node.js)
•	Backend Microservices (Spring Boot)
•	Data Layer (separate databases per service)
•	Authentication (AWS Cognito)

5. Logical Components
5.1 Frontend
•	User Authentication
•	Product Listing & Search
•	Product Details View
•	Cart Management
•	Supplier Dashboard
•	Data Steward Dashboard
5.2 BFF (Node.js)
•	Acts as single entry point for frontend
•	Aggregates responses from backend services
•	Handles frontend specific API needs
5.3 Backend Microservices
•	User Service
•	Product Service
•	Order Service
•	Supply Management Service
Each service:
•	Is independently deployable
•	Exposes REST APIs
•	Owns its own database

6. Data Layer
Databases:
•	User DB
•	Product DB
•	Order DB
•	Supplier DB
No shared databases across services.

7. Authentication & Security
•	Authentication via AWS Cognito
•	Role based access: 
o	Customer
o	Supplier
o	Data Steward
•	Secure communication over HTTPS

8. API Design
•	APIs defined using OpenAPI (Swagger)
•	API specification finalized before development
•	RESTful endpoints for all services

9. Development Approach
Technology Stack
•	Frontend: React.js, Redux, Single SPA
•	BFF: Node.js
•	Backend: Java Spring Boot
•	Authentication: AWS Cognito
•	Deployment: Docker + AWS

10. Testing & Quality
•	Unit tests for utility/business logic
•	Minimum 5 end to end test cases
•	Static code analysis
•	Proper error handling and validations

11. Deployment
•	Services containerized using Docker
•	Deployed to AWS non production environment
•	Code version controlled using GitHub
•	Feature branch workflow with PR reviews

