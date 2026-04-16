# AWS Cognito Manual Configuration Steps

## Prerequisites
- AWS Account with appropriate permissions
- Access to AWS Console

## Step-by-Step Configuration

### STEP 1: Create User Pool

1. Open AWS Console → Search for "Cognito"
2. Click on **Cognito** service
3. Click **Create user pool**

**Pool Settings:**
- Pool name: `ecommerce-user-pool`
- Sign-in options: Select **Email**
- Click **Next**

**Security Settings:**
- Password minimum length: 8 (default is fine)
- Require numbers: ✓
- Require special characters: ✓
- Click **Next**

**Self-Service Sign-Up:**
- Self-registration enabled: ✓
- Allow users to recover their account: ✓
- Click **Next**

**Message Delivery:**
- Select: **Send email with Cognito**
- Click **Next**

**Review:**
- Review settings
- Click **Create user pool**

**Save this value:**
- User Pool ID: `___________________________`

---

### STEP 2: Create App Client

Inside your user pool:
1. Go to **App integration** → **App clients and analytics**
2. Click **Create app client**

**App client settings:**
- App client name: `ecommerce-frontend`
- Choose **Public client** (for frontend apps)
- Click **Next**

**Authentication Flows:**
- Uncheck all default flows
- Check ONLY:
  - ✓ ALLOW_REFRESH_TOKEN_AUTH
  - ✓ ALLOW_USER_PASSWORD_AUTH (for testing)
- Click **Next**

**Redirect URLs:**
- Allowed callback URLs: `http://localhost:3000/auth/callback`
- Allowed logout URLs: `http://localhost:3000`
- Click **Next**

**Token Expiration:**
- Leave defaults (60 minutes for access/ID token)
- Click **Create app client**

**Save these values:**
- Client ID: `___________________________`

---

### STEP 3: Configure OAuth2 Settings

In your user pool:
1. Go to **App integration** → **App client settings**
2. Select your `ecommerce-frontend` app client
3. Scroll to **OAuth 2.0** section:

**OAuth2 settings:**
- Allowed OAuth Flows:
  - ✓ Authorization code flow
  - ✓ Refresh token flow
- Allowed OAuth Scopes:
  - ✓ openid
  - ✓ email
  - ✓ profile
- Click **Save changes**

---

### STEP 4: Create Cognito Domain

In your user pool:
1. Go to **App integration** → **Domain name**
2. Enter a domain name (must be globally unique):
   - Example: `myecommerce-12345` (alphanumeric + hyphens only)
3. Click **Check availability**
4. Click **Save changes**

**Wait 10-15 minutes for domain activation**

**Save this value:**
- Domain name: `myecommerce-12345` (without .auth.region.amazoncognito.com)
- Full domain: `myecommerce-12345.auth.us-east-1.amazoncognito.com`

---

### STEP 5: Create User Groups (Roles)

In your user pool:
1. Go to **Users** → **Groups**
2. Click **Create group**

**Create Group 1: Customer**
- Group name: `Customer`
- Description: Standard customer with shopping capabilities
- Click **Create group**

**Create Group 2: Supplier**
- Group name: `Supplier`
- Description: Supplier who can add and manage products
- Click **Create group**

**Create Group 3: Data Steward**
- Group name: `Data Steward`
- Description: Administrator who approves products
- Click **Create group**

---

### STEP 6: Create Test Users

In your user pool:
1. Go to **Users** → **Create user**

**Create User 1: Customer**
- Username: `customer1@example.com`
- Email: `customer1@example.com`
- Email verified: ✓ Check this box
- Temporary password: `MyTestPass123!`
- Mark password as permanent: ✓
- Click **Create user**

Then:
- Click on the created user
- Go to **Group memberships** → **Add user to groups**
- Select `Customer` group
- Click **Add to groups**

**Repeat for Supplier and Data Steward**

---

### STEP 7: Gather All Required Values

Go to your user pool:
1. **General settings** → Get:
   - User Pool ID: `us-east-1_XXXXXXXXX`
   - Region: `us-east-1`

2. **App clients and analytics** → Get:
   - Client ID (from your ecommerce-frontend app)

3. **Domain name** → Get:
   - Full domain: `myecommerce-12345.auth.us-east-1.amazoncognito.com`

---

## Summary of Values You Need

Collect these values and fill in your `.env` files:

| Value | Where to Find | Example |
|-------|---------------|---------|
| User Pool ID | General settings | `us-east-1_XXXXXXXXX` |
| Client ID | App clients → Select app → Client ID | `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6` |
| Cognito Domain | App integration → Domain name | `myecommerce-12345.auth.us-east-1.amazoncognito.com` |
| Region | User Pool region | `us-east-1` |

---

## Verify Configuration

After creating everything:

### Check User Pool
- [ ] User pool exists and is active
- [ ] App client exists
- [ ] OAuth domain is active (may take 10-15 minutes)
- [ ] Three groups exist (Customer, Supplier, Data Steward)
- [ ] At least 3 test users exist, one in each group

### Check App Client
- [ ] Callback URL includes: `http://localhost:3000/auth/callback`
- [ ] Logout URL includes: `http://localhost:3000`
- [ ] OAuth flows enabled: Authorization code, Refresh token
- [ ] OAuth scopes enabled: openid, email, profile

### Check Domain
- [ ] Domain name is globally unique
- [ ] Status shows "Active"
- [ ] Full domain format: `*.auth.region.amazoncognito.com`

---

## Common Issues

### Issue: Domain name already exists
**Solution:** Use a more unique domain name (add numbers, your company name, etc.)

### Issue: Can't add user to group
**Solution:** Make sure group is created first, then add user via "Group memberships" section

### Issue: "Invalid redirect_uri" error during login
**Solution:** Verify callback URL in app client settings matches exactly: 
- Must be: `http://localhost:3000/auth/callback`
- Not: `http://localhost:3000/auth/callback/`

### Issue: User can't login
**Solution:** 
- Check user is created and set as permanent
- Check email is verified (✓ in user details)
- Check user is added to a group

---

## Next: Configure Your Application

Once all AWS values are collected:

1. **Frontend .env**
```env
REACT_APP_BFF_API_URL=http://localhost:3001
REACT_APP_COGNITO_DOMAIN=myecommerce-12345.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6
REACT_APP_COGNITO_REGION=us-east-1
```

2. **BFF .env**
```env
COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX
COGNITO_AUDIENCE=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6
```

3. **Backend environment variables**
```bash
export COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
export COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6
```

Then start the application and test the login flow!
