# Integration Configuration & Setup Guide

Step-by-step configuration for secure end-to-end integration.

---

## 1. Frontend Configuration

### 1.1 Create .env File

```bash
# frontend/.env
```

```env
# API Configuration
REACT_APP_BFF_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_TOKEN_STORAGE=localStorage
REACT_APP_TOKEN_EXPIRY_MS=3600000  # 1 hour
REACT_APP_TOKEN_REFRESH_THRESHOLD=300000  # Refresh 5 min before expiry

# Feature Flags
REACT_APP_DEBUG=true
REACT_APP_ENABLE_LOGGING=true

# Environment
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

### 1.2 Setup API Service

Create `frontend/src/services/apiService.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiService {
  private client: AxiosInstance;
  private requestInterceptor: number | null = null;
  private responseInterceptor: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_BFF_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add authorization header
    this.requestInterceptor = this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request tracking
        (config as any).metadata = { startTime: Date.now() };

        if (process.env.REACT_APP_ENABLE_LOGGING === 'true') {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle responses and errors
    this.responseInterceptor = this.client.interceptors.response.use(
      (response) => {
        const metadata = (response.config as any).metadata;
        const duration = metadata ? Date.now() - metadata.startTime : 0;

        if (process.env.REACT_APP_ENABLE_LOGGING === 'true') {
          console.log(`[API] ${response.status} - ${duration}ms`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalConfig = error.config as any;

        // Handle token expiration
        if (error.response?.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.client.post('/api/auth/refresh', {
                refresh_token: refreshToken
              });

              localStorage.setItem('access_token', response.data.access_token);
              
              // Retry original request
              originalConfig.headers.Authorization = `Bearer ${response.data.access_token}`;
              return this.client(originalConfig);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('id_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        // Log errors
        console.error('[API Error]', error.response?.status, error.response?.data);

        return Promise.reject(error);
      }
    );
  }

  // API methods
  async get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data: any, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data: any, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }

  // Cleanup
  destroy() {
    if (this.requestInterceptor !== null) {
      this.client.interceptors.request.eject(this.requestInterceptor);
    }
    if (this.responseInterceptor !== null) {
      this.client.interceptors.response.eject(this.responseInterceptor);
    }
  }
}

export default new ApiService();
```

### 1.3 Create Auth Service

Create `frontend/src/services/authService.ts`:

```typescript
import apiService from './apiService';

export interface LoginRequest {
  username: string;
  role: 'Customer' | 'Supplier' | 'Data Steward';
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface User {
  sub: string;
  username: string;
  email: string;
  role: string;
  email_verified: boolean;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiService.post<TokenResponse>(
      '/api/auth/login',
      credentials
    );

    // Store tokens
    this.storeTokens(response.data);

    return response.data;
  }

  async logout(): Promise<void> {
    await apiService.post('/api/auth/logout', {});
    this.clearTokens();
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('id_token', tokens.id_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', 
      (Date.now() + tokens.expires_in * 1000).toString()
    );
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getIdToken(): string | null {
    return localStorage.getItem('id_token');
  }

  getCurrentUser(): User | null {
    const idToken = this.getIdToken();
    if (!idToken) return null;

    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;

    return Date.now() > parseInt(expiresAt);
  }
}

export default new AuthService();
```

---

## 2. BFF Configuration

### 2.1 Create .env File

```bash
# bff/.env
```

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_CREDENTIALS=true

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production-12345
JWT_ISSUER=local-auth
JWT_AUDIENCE=ecommerce-platform
JWT_EXPIRY=3600

# Microservice URLs
USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
SUPPLY_SERVICE_URL=http://localhost:8084

# Timeouts
SERVICE_TIMEOUT=30000
CONNECT_TIMEOUT=5000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined
```

### 2.2 Setup BFF Server

Create `bff/src/server.ts`:

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authMiddleware, requireRole, auditLog } from './middleware/authMiddleware';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// ========== MIDDLEWARE SETUP ==========

// CORS Configuration
app.use(cors({
  origin: frontendUrl,
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Request tracing
app.use((req: any, req: Request, res: Response, next: NextFunction) => {
  req.id = req.get('X-Request-ID') || generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ========== PUBLIC ROUTES ==========

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// ========== PROTECTED ROUTES ==========

// Apply authentication middleware to all other routes
app.use('/api', authMiddleware, auditLog);

// Product routes
app.use('/api/products', productRoutes);

// User routes (requires DATA_STEWARD role)
app.use('/api/users', requireRole(['Data Steward']), userRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// ========== SERVER START ==========

app.listen(port, () => {
  console.log(`\n🚀 BFF Server running on port ${port}`);
  console.log(`   Frontend URL: ${frontendUrl}`);
  console.log(`   Environment: ${process.env.NODE_ENV}\n`);
});

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default app;
```

### 2.3 Setup Routes

Create `bff/src/routes/products.ts`:

```typescript
import { Router, Response } from 'express';
import axios from 'axios';
import { AuthRequest, requireRole } from '../middleware/authMiddleware';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8082';

const productClient = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000')
});

// ========== GET PRODUCTS ==========

/**
 * GET /api/products
 * Get all products (accessible to all authenticated users)
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const response = await productClient.get('/api/products', {
      headers: { 'Authorization': req.headers.authorization }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Failed to get products:', error.message);
    
    if (error.response?.status === 503) {
      return res.status(503).json({
        error: 'Product service unavailable'
      });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch products'
    });
  }
});

/**
 * GET /api/products/:id
 * Get specific product
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const response = await productClient.get(`/api/products/${req.params.id}`, {
      headers: { 'Authorization': req.headers.authorization }
    });

    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Product not found'
    });
  }
});

// ========== CREATE PRODUCT ==========

/**
 * POST /api/products
 * Create new product (suppliers only)
 */
router.post('/',
  requireRole(['Supplier']),
  validateRequest(schemas.createProduct),
  async (req: AuthRequest, res: Response) => {
    try {
      const response = await productClient.post('/api/products',
        req.body,
        { headers: { 'Authorization': req.headers.authorization } }
      );

      res.status(201).json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Failed to create product'
      });
    }
  }
);

// ========== APPROVE PRODUCT ==========

/**
 * PUT /api/products/:id/approve
 * Approve product (data stewards only)
 */
router.put('/:id/approve',
  requireRole(['Data Steward']),
  async (req: AuthRequest, res: Response) => {
    try {
      const response = await productClient.put(
        `/api/products/${req.params.id}/approve`,
        {},
        { headers: { 'Authorization': req.headers.authorization } }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to approve product'
      });
    }
  }
);

export default router;
```

---

## 3. Backend Configuration

### 3.1 Create application.properties

Create `backend/[service]/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8081
spring.application.name=user-service

# Database Configuration
spring.datasource.url=jdbc:h2:mem:userdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT Configuration
jwt.secret=your-super-secret-key-change-in-production-12345
jwt.expiration-ms=3600000

# CORS Configuration
cors.allowed-origins=http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600

# Logging
logging.level.root=INFO
logging.level.com.ecommerce=DEBUG
```

### 3.2 Setup Security Configuration

Create `backend/[service]/src/main/java/com/ecommerce/config/SecurityConfig.java`:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

  @Bean
  public JwtTokenFilter jwtTokenFilter() {
    return new JwtTokenFilter();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .cors()
      .and()
      .csrf().disable()
      .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      .and()
      .authorizeRequests()
        .antMatchers("/api/auth/**", "/health", "/h2-console/**").permitAll()
        .antMatchers("/api/users").hasRole("DATA_STEWARD")
        .anyRequest().authenticated()
      .and()
      .addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
```

---

## 4. Verification Checklist

### 4.1 Frontend

```bash
# Check .env file
cat frontend/.env

# Verify API service is imported
grep -r "apiService" frontend/src/pages/

# Check auth service implementation
cat frontend/src/services/authService.ts | head -20
```

### 4.2 BFF

```bash
# Check environment variables
cat bff/.env

# Verify routes are registered
grep -r "app.use" bff/src/server.ts

# Check middleware is applied
grep -r "authMiddleware" bff/src/routes/
```

### 4.3 Backend

```bash
# Check application properties
cat backend/user-service/src/main/resources/application.properties | grep jwt

# Verify JWT filter is enabled
grep -r "JwtTokenFilter" backend/user-service/src/

# Check @PreAuthorize annotations
grep -r "@PreAuthorize" backend/user-service/src/
```

---

## 5. Quick Verification Script

Create `verify-integration.sh`:

```bash
#!/bin/bash

echo "🔍 Verifying Integration Configuration..."

# Check Frontend
echo -e "\n📱 Frontend:"
if [ -f "frontend/.env" ]; then
  echo "  ✓ .env file exists"
  grep REACT_APP_BFF_URL frontend/.env
else
  echo "  ✗ .env file missing"
fi

# Check BFF
echo -e "\n🌐 BFF:"
if [ -f "bff/.env" ]; then
  echo "  ✓ .env file exists"
  grep JWT_SECRET bff/.env
else
  echo "  ✗ .env file missing"
fi

# Check Backend
echo -e "\n⚙️  Backend:"
if [ -f "backend/user-service/src/main/resources/application.properties" ]; then
  echo "  ✓ application.properties exists"
  grep "jwt.secret" backend/user-service/src/main/resources/application.properties
else
  echo "  ✗ application.properties missing"
fi

# Check services running
echo -e "\n🚀 Services Status:"
echo "  Frontend (3000): $(curl -s http://localhost:3000 > /dev/null && echo '✓' || echo '✗')"
echo "  BFF (3001): $(curl -s http://localhost:3001/health > /dev/null && echo '✓' || echo '✗')"
echo "  User Service (8081): $(curl -s http://localhost:8081/health > /dev/null && echo '✓' || echo '✗')"
echo "  Product Service (8082): $(curl -s http://localhost:8082/health > /dev/null && echo '✓' || echo '✗')"

echo -e "\n✅ Verification complete!"
```

Run it:
```bash
chmod +x verify-integration.sh
./verify-integration.sh
```

---

**All configuration files are now in place for secure end-to-end integration.**

