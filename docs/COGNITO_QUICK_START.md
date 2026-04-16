# Quick Start: Cognito Authentication

## 1. AWS Configuration (Manual Steps)

Follow the detailed guide: [AWS_COGNITO_SETUP.md](AWS_COGNITO_SETUP.md)

**TL;DR:**
1. Create User Pool in Cognito
2. Create App Client (Public client for frontend)
3. Create 3 Groups: Customer, Supplier, Data Steward
4. Configure OAuth callback: `http://localhost:3000/auth/callback`
5. Create test users and assign to groups
6. Copy your credentials

## 2. Environment Configuration

### Frontend (frontend/.env)
```env
REACT_APP_BFF_API_URL=http://localhost:3001
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=your-client-id
REACT_APP_COGNITO_REGION=us-east-1
```

### BFF (bff/.env)
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

### Backend Services (Environment Variables)
```bash
export COGNITO_REGION=us-east-1
export COGNITO_USER_POOL_ID=your-user-pool-id
export COGNITO_CLIENT_ID=your-client-id
```

## 3. Start the Application

### Terminal 1: Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Terminal 2: BFF
```bash
cd bff
npm install
npm run dev
# Runs on http://localhost:3001
```

### Terminal 3-6: Backend Services
```bash
# In separate terminals:
cd backend/user-service && mvn spring-boot:run
cd backend/product-service && mvn spring-boot:run
cd backend/order-service && mvn spring-boot:run
cd backend/supply-management-service && mvn spring-boot:run
```

## 4. Test the Flow

1. Open `http://localhost:3000`
2. Click **Login**
3. Enter Cognito test user email and password
4. Authorize the application
5. Should redirect to home page with user email displayed
6. Check browser DevTools → Application → Local Storage for tokens

## 5. Code Integration Points

### Using Auth in Components (Frontend)
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      {hasRole('Supplier') && <p>You are a supplier</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes (Frontend)
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<ProtectedRoute requiredRoles={['Supplier']}>
  <SupplierDashboard />
</ProtectedRoute>
```

### Protecting BFF Routes (Node.js)
```typescript
import { authMiddleware, requireRole } from './middleware/authMiddleware';

router.post('/api/products/approve',
  authMiddleware,
  requireRole(['Data Steward']),
  (req, res) => {
    // Only Data Stewards can access
  }
);
```

### Protecting Backend Endpoints (Spring Boot)
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
  
  @PreAuthorize("hasRole('Supplier')")
  @PostMapping
  public ResponseEntity<?> createProduct(@RequestBody Product product) {
    // Only Suppliers can create products
  }
  
  @PreAuthorize("hasRole('Data Steward')")
  @PostMapping("/{id}/approve")
  public ResponseEntity<?> approveProduct(@PathVariable String id) {
    // Only Data Stewards can approve
  }
}
```

## 6. Verify Implementation

### Test User Flow
1. Create these test users in Cognito:
   - `customer@test.com` → Add to `Customer` group
   - `supplier@test.com` → Add to `Supplier` group
   - `steward@test.com` → Add to `Data Steward` group

2. Test each user:
   - Login with each user
   - Verify roles appear in token
   - Check that role-protected pages work

### Check Tokens in Browser
```javascript
// Open browser console and run:
const token = localStorage.getItem('id_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);

// Should output:
// {
//   "sub": "...",
//   "email": "customer@test.com",
//   "cognito:groups": ["Customer"],
//   "email_verified": true,
//   ...
// }
```

### Call Backend API
```bash
# Get token from localStorage in browser
TOKEN="<copy id_token from localStorage>"

# Call BFF auth endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/me

# Should return current user info and roles
```

## 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| Login button does not work | Check COGNITO_DOMAIN and CLIENT_ID in .env |
| "Invalid redirect_uri" error | Add callback URL to Cognito App Client settings |
| Token not validated on backend | Check COGNITO_USER_POOL_ID in backend env vars |
| Roles not appearing in token | Verify user is added to group in Cognito console |
| CORS errors | Check FRONTEND_URL in BFF .env matches your frontend URL |
| "User has no role" on protected route | User must be added to at least one group |

## 8. What's Already Configured

✅ OAuth2 Authorization Code Flow
✅ JWT token validation
✅ Role extraction from Cognito groups
✅ Frontend auth service and context
✅ BFF auth middleware
✅ Backend JWT validation
✅ Role-based access control
✅ Protected routes and endpoints
✅ Login/logout flow
✅ Token refresh support

## 9. What You Need to Do

- [ ] Create AWS Cognito User Pool
- [ ] Create App Client
- [ ] Create 3 user groups
- [ ] Configure OAuth domain
- [ ] Fill in `.env` files with your credentials
- [ ] Create test users
- [ ] Test the login flow
- [ ] Test role-based access

## Next Steps

After verifying authentication works:
1. Create API endpoints for each service
2. Add database models
3. Implement business logic
4. Add proper error handling
5. Create comprehensive tests
6. Deploy to AWS

See [AUTHENTICATION_IMPLEMENTATION.md](AUTHENTICATION_IMPLEMENTATION.md) for detailed implementation reference.
