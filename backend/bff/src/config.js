/**
 * BFF Configuration
 * Central configuration for all service endpoints and security settings
 */

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '1h',
    algorithm: 'HS256',
  },

  // Microservices endpoints
  services: {
    userService: {
      baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:8081',
      name: 'User Service',
    },
    productService: {
      baseUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8082',
      name: 'Product Service',
    },
    orderService: {
      baseUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:8083',
      name: 'Order Service',
    },
    supplierService: {
      baseUrl: process.env.SUPPLIER_SERVICE_URL || 'http://localhost:8084',
      name: 'Supply Management Service',
    },
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Request timeout (milliseconds)
  httpTimeout: 30000,

  // Test users (for login)
  testUsers: [
    {
      id: 1,
      username: 'customer1',
      password: 'pass123',
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer1@example.com',
      role: 'CUSTOMER',
    },
    {
      id: 2,
      username: 'supplier1',
      password: 'pass123',
      firstName: 'Jane',
      lastName: 'Supplier',
      email: 'supplier1@example.com',
      role: 'SUPPLIER',
    },
    {
      id: 3,
      username: 'admin1',
      password: 'pass123',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin1@example.com',
      role: 'DATA_STEWARD',
    },
  ],

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'combined',
  },
};
