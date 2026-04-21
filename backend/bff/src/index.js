/**
 * Backend for Frontend (BFF) Server
 * Main entry point for the BFF application
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const { errorHandler } = require('./utils/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const authController = require('./routes/authController');
const proxyRoutes = require('./routes/proxy');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(morgan(config.logging.level));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      userService: config.services.userService.baseUrl,
      productService: config.services.productService.baseUrl,
      orderService: config.services.orderService.baseUrl,
      supplierService: config.services.supplierService.baseUrl,
    },
  });
});

/**
 * Authentication Routes
 * No middleware protection required for login
 */
app.post('/auth/login', authController.login);

// Protected auth routes
app.get('/auth/me', authenticateToken, authController.getCurrentUser);
app.get('/auth/roles', authenticateToken, authController.getRoles);

/**
 * Proxy Routes
 * All API calls to microservices
 */
app.use('/api', proxyRoutes);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Endpoint not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Error Handler
 * Must be last middleware
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`\n✓ BFF Server running on port ${PORT}`);
  console.log(`✓ Environment: ${config.server.env}`);
  console.log(`✓ Frontend: ${config.cors.origin}`);
  console.log(`✓ CORS enabled\n`);

  console.log('Connected Services:');
  console.log(`  • User Service:              ${config.services.userService.baseUrl}`);
  console.log(`  • Product Service:          ${config.services.productService.baseUrl}`);
  console.log(`  • Order Service:            ${config.services.orderService.baseUrl}`);
  console.log(`  • Supply Management Service: ${config.services.supplierService.baseUrl}\n`);

  console.log('Available Endpoints:');
  console.log(`  • POST   /auth/login              (No auth required)`);
  console.log(`  • GET    /auth/me                 (Requires JWT)`);
  console.log(`  • GET    /auth/roles              (Requires JWT)`);
  console.log(`  • GET/POST /api/users            (User management)`);
  console.log(`  • GET/POST /api/products         (Product catalog)`);
  console.log(`  • GET/POST /api/orders           (Order management)`);
  console.log(`  • GET/POST /api/suppliers        (Supplier management)\n`);
});

module.exports = app;
