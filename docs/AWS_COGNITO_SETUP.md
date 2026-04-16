# AWS Cognito Authentication Setup Guide

## Overview
This guide explains how to configure AWS Cognito for the eCommerce application. The application uses:
- **OAuth2** for authorization code flow
- **JWT tokens** for stateless authentication
- **User groups** (roles) for role-based access control

## Architecture

```
User Login Request
    ↓
Frontend → Cognito Authorization Endpoint
    ↓
User Authenticates & Authorizes
    ↓
Cognito → Frontend (Redirect with Auth Code)
    ↓
Frontend → Cognito Token Endpoint (Exchange Code)
    ↓
Frontend receives: ID Token, Access Token, Refresh Token
    ↓
Frontend → BFF (with Access Token)
    ↓
BFF → Validates Token & Forwards to Backend Services
    ↓
Backend Services → Validate JWT & Extract User Info
```

## AWS Cognito Manual Configuration Steps

### Step 1: Create Cognito User Pool

1. Go to **AWS Console → Cognito**
2. Click **Create user pool**
3. Configure:
   - **Pool name**: `ecommerce-user-pool`
   - **Sign-in options**: Select "Email"
   - Click **Next**

4. **Configure security requirements**:
   - Password policy: Default or custom
   - MFA: Optional (Off for development)
   - Click **Next**

5. **Configure sign-up experience**:
   - Self-registration: Enabled
   - Click **Next**

6. **Configure message delivery**:
   - Send email with Cognito: Select this
   - Click **Next**

7. **Review and Create**: Click **Create user pool**

### Step 2: Create Cognito App Client

1. In your user pool, go to **App integration → App clients and analytics**
2. Click **Create app client**
3. Configure:
   - **App client name**: `ecommerce-frontend`
   - **App type**: Public client (for frontend)
   - Click **Next**

4. **Configure authentication flows**:
   - Check: `ALLOW_REFRESH_TOKEN_AUTH`
   - Check: `ALLOW_USER_PASSWORD_AUTH`
   - Uncheck other flows
   - Click **Next**

5. **Configure the redirect URIs**:
   - **Allowed callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed logout URLs**: `http://localhost:3000`
   - Click **Next**

6. **Configure token expiration**:
   - ID token expiration: 60 minutes (default)
   - Access token expiration: 60 minutes (default)
   - Refresh token expiration: 30 days (default)
   - Click **Create app client**

### Step 3: Create User Groups (Roles)

1. In your user pool, go to **Users → Groups**
2. Create three groups:

   **Group 1: Customer**
   - **Group name**: `Customer`
   - **Description**: Standard customer with shopping capabilities
   - Click **Create group**

   **Group 2: Supplier**
   - **Group name**: `Supplier`
   - **Description**: Supplier who can add/manage products
   - Click **Create group**

   **Group 3: Data Steward**
   - **Group name**: `Data Steward`
   - **Description**: Administrator who approves products
   - Click **Create group**

### Step 4: Configure App Client Settings (OAuth2)

1. In your user pool, go to **App integration → App client settings**
2. Select your app client
3. Configure **OAuth 2.0**:
   - **Allowed OAuth Flows**: Authorization code, Refresh token
   - **Allowed OAuth Scopes**: openid, email, profile
   - Click **Save changes**

### Step 5: Get Your Configuration Values

You'll need these values for your application:

1. **User Pool ID**:
   - In user pool: General settings → Pool ID
   - Format: `us-east-1_XXXXXXXXX`

2. **Client ID**:
   - In App clients: Your app client → Client ID

3. **Cognito Domain**:
   - In App integration → Domain name
   - Configure a unique domain name (must be globally unique)
   - Format: `your-domain.auth.us-east-1.amazoncognito.com`

4. **Region**: (e.g., `us-east-1`)

## Application Configuration

### Frontend (.env)

Create `.env` file in the `frontend/` directory:

```env
REACT_APP_BFF_API_URL=http://localhost:3001
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=your-client-id-here
REACT_APP_COGNITO_REGION=us-east-1
```

Example:
```env
REACT_APP_BFF_API_URL=http://localhost:3001
REACT_APP_COGNITO_DOMAIN=myecommerce.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l
REACT_APP_COGNITO_REGION=us-east-1
```

### BFF (.env)

Create `.env` file in the `bff/` directory:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLY_MANAGEMENT_SERVICE_URL=http://localhost:8084

COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id
COGNITO_AUDIENCE=your-client-id
```

Example:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLY_MANAGEMENT_SERVICE_URL=http://localhost:8084

COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX
COGNITO_AUDIENCE=1a2b3c4d5e6f7g8h9i0j1k2l
```

### Backend Services (Environment Variables)

Set these environment variables for each Spring Boot service:

```bash
export COGNITO_REGION=us-east-1
export COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
export COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l
```

Or in Docker Compose (already configured in `docker-compose.yml`).

## Creating Test Users

### Option 1: Using AWS Console

1. In your user pool, go to **Users**
2. Click **Create user**
3. Fill in:
   - **Username**: `testcustomer@example.com`
   - **Email**: `testcustomer@example.com`
   - **Temporary password**: Enter a temporary password
   - Click **Create user**

4. Add user to group:
   - Click on the created user
   - Go to **Group memberships**
   - Add the user to `Customer` group

5. Confirm user email:
   - Click on user
   - Go to **Email verified**: Check this box
   - Click **Save changes**

### Option 2: Using AWS CLI

```bash
# Create user
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username testcustomer@example.com \
  --user-attributes Name=email,Value=testcustomer@example.com \
  --message-action SUPPRESS \
  --region us-east-1

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username testcustomer@example.com \
  --password TempPassword123! \
  --permanent \
  --region us-east-1

# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username testcustomer@example.com \
  --group-name Customer \
  --region us-east-1
```

## Frontend Integration Points

### 1. Login
```typescript
// src/services/CognitoAuthService.ts → login()
// Redirects user to Cognito login page
```

### 2. Auth Callback
```typescript
// src/pages/AuthCallback.tsx
// Handles redirect from Cognito, exchanges code for tokens
```

### 3. Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
// Wraps components, enforces authentication and roles
<ProtectedRoute requiredRoles={['Supplier']}>
  <SupplierDashboard />
</ProtectedRoute>
```

### 4. Auth Context
```typescript
// src/contexts/AuthContext.tsx
// Provides useAuth() hook for accessing auth state
const { user, isAuthenticated, hasRole } = useAuth();
```

## BFF Integration Points

### 1. Auth Middleware
```typescript
// bff/src/middleware/authMiddleware.ts
// Validates JWT tokens from Cognito
// Extracts user info and roles
```

### 2. Role-Based Access
```typescript
// Usage in routes:
router.post('/api/products/approve', 
  authMiddleware,
  requireRole(['Data Steward']),
  approveProductHandler
);
```

## Backend Service Integration Points

### 1. Spring Security Configuration
```java
// backend/*/src/main/java/*/config/SecurityConfig.java
// Configures OAuth2 Resource Server
// Validates JWT tokens from Cognito
```

### 2. JWT Converter
```java
// backend/*/src/main/java/*/config/JwtAuthenticationConverter.java
// Extracts cognito:groups and converts to Spring Security roles
```

### 3. Protected Endpoints
```java
// Usage in controllers:
@PreAuthorize("hasRole('Data Steward')")
@PostMapping("/products/{id}/approve")
public ResponseEntity<?> approveProduct(@PathVariable String id) {
    // Only Data Stewards can access
}
```

## Role-Based Authorization Examples

### Frontend
```tsx
// Show component only to Suppliers
if (useAuth().hasRole('Supplier')) {
  return <SupplierDashboard />;
}

// Protect route by role
<ProtectedRoute requiredRoles={['Data Steward']}>
  <ApprovalDashboard />
</ProtectedRoute>
```

### BFF
```typescript
// Route protected by role
router.post('/api/products/approve', 
  authMiddleware,
  requireRole(['Data Steward']),
  (req, res) => { /* handle */ }
);
```

### Backend
```java
// Method-level security
@PreAuthorize("hasRole('Supplier')")
public Product addProduct(Product product) {
  // Only suppliers can call
}

@PreAuthorize("hasRole('Data Steward')")
public void approveProduct(String productId) {
  // Only data stewards can call
}
```

## Testing Authentication

### 1. Start the application

```bash
# Terminal 1: Frontend
cd frontend
npm start

# Terminal 2: BFF
cd bff
npm run dev

# Terminal 3-6: Backend services
cd backend/user-service && mvn spring-boot:run
cd backend/product-service && mvn spring-boot:run
cd backend/order-service && mvn spring-boot:run
cd backend/supply-management-service && mvn spring-boot:run
```

### 2. Test login flow
- Navigate to `http://localhost:3000`
- Click Login
- Use your Cognito test user credentials
- Should redirect to `/auth/callback` and authenticate
- Check browser console for token

### 3. Test role-based access
- Create test users with different roles
- Login with each user
- Verify that role-restricted pages are accessible/inaccessible

### 4. Test BFF auth
```bash
# Get access token from frontend (check localStorage)
BEARER_TOKEN="your-access-token"

# Call BFF endpoint
curl -H "Authorization: Bearer $BEARER_TOKEN" \
  http://localhost:3001/api/auth/me

# Check response includes user and roles
```

## Token Details

### JWT Token Claims
Cognito tokens include:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "cognito:groups": ["Customer", "Supplier"],
  "email_verified": true,
  "exp": 1234567890,
  "iat": 1234567800
}
```

### Token Types
- **ID Token**: User identity information (frontend)
- **Access Token**: For API access (BFF, backend services)
- **Refresh Token**: To get new tokens when expired

## Troubleshooting

### Issue: "Invalid redirect_uri"
- Verify callback URL in Cognito matches frontend URL
- For local dev: `http://localhost:3000/auth/callback`
- For production: Use your domain

### Issue: "Invalid client_id"
- Check that Client ID matches in `.env` files
- Ensure it's not the User Pool ID

### Issue: "Token verification failed"
- Verify User Pool ID is correct
- Check that issuer-uri matches Cognito domain
- Ensure JWK endpoint is accessible

### Issue: "User has no roles"
- Verify user is added to a group in Cognito
- Check cognito:groups claim in JWT
- Ensure groups are configured correctly

### Issue: "Access Denied" on backend
- Check that user has required role
- Verify JwtAuthenticationConverter is extracting roles
- Check @PreAuthorize annotation syntax

## Next Steps

1. Create test users with each role
2. Test login flow end-to-end
3. Verify role-based access control works
4. Test token refresh flow
5. Test logout/session management
6. Move to production configuration (TLS, real domain, etc.)
