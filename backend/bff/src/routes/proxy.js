/**
 * Proxy Routes
 * Routes that forward requests to microservices
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const httpClient = require('../utils/httpClient');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * Generic proxy handler
 * Forwards request to specified service with JWT token
 */
async function proxyHandler(serviceName, baseUrl) {
  return async (req, res, next) => {
    try {
      const method = req.method.toLowerCase();
      const path = req.path;
      const data = req.body;
      const token = req.token;

      const response = await httpClient[method](serviceName, baseUrl, path, data, token);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

// Apply authentication to all proxy routes
router.use(authenticateToken);

/**
 * USER SERVICE ROUTES (Port 8081)
 */
// GET /api/users - List all users (DATA_STEWARD only)
router.get('/users', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/users${req.url.split('/users')[1] || ''}`;
    const response = await httpClient.get(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create user (DATA_STEWARD only)
router.post('/users', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const response = await httpClient.post(
      config.services.userService.name,
      config.services.userService.baseUrl,
      '/api/users',
      req.body,
      req.token
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/{id}
router.get('/users/:id', async (req, res, next) => {
  try {
    const path = `/api/users/${req.params.id}`;
    const response = await httpClient.get(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/{id}
router.put('/users/:id', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/users/${req.params.id}`;
    const response = await httpClient.put(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/{id}
router.delete('/users/:id', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/users/${req.params.id}`;
    await httpClient.delete(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.token
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/users/username/{username}
router.get('/users/username/:username', async (req, res, next) => {
  try {
    const path = `/api/users/username/${req.params.username}`;
    const response = await httpClient.get(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/{id}/status
router.patch('/users/:id/status', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/users/${req.params.id}/status`;
    const response = await httpClient.patch(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/{id}/role
router.patch('/users/:id/role', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/users/${req.params.id}/role`;
    const response = await httpClient.patch(
      config.services.userService.name,
      config.services.userService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PRODUCT SERVICE ROUTES (Port 8082)
 */
// GET /api/products
router.get('/products', async (req, res, next) => {
  try {
    const path = `/api/products${req.url.split('/products')[1] || ''}`;
    const response = await httpClient.get(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/products', requireRole('SUPPLIER'), async (req, res, next) => {
  try {
    const response = await httpClient.post(
      config.services.productService.name,
      config.services.productService.baseUrl,
      '/api/products',
      req.body,
      req.token
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/{id}
router.get('/products/:id', async (req, res, next) => {
  try {
    const path = `/api/products/${req.params.id}`;
    const response = await httpClient.get(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/{id}
router.delete('/products/:id', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/products/${req.params.id}`;
    await httpClient.delete(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      req.token
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/products/{id}/approve
router.post('/products/:id/approve', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/products/${req.params.id}/approve`;
    const response = await httpClient.post(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/products/{id}/reject
router.post('/products/:id/reject', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/products/${req.params.id}/reject`;
    const response = await httpClient.post(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      req.body || {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/products/{id}/stock
router.patch('/products/:id/stock', requireRole('SUPPLIER'), async (req, res, next) => {
  try {
    const path = `/api/products/${req.params.id}/stock`;
    const response = await httpClient.patch(
      config.services.productService.name,
      config.services.productService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * ORDER SERVICE ROUTES (Port 8083)
 */
// GET /api/orders
router.get('/orders', async (req, res, next) => {
  try {
    const path = `/api/orders${req.url.split('/orders')[1] || ''}`;
    const response = await httpClient.get(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
router.post('/orders', requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const response = await httpClient.post(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      '/api/orders',
      req.body,
      req.token
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/{id}
router.get('/orders/:id', async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}`;
    const response = await httpClient.get(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/{id}
router.delete('/orders/:id', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}`;
    await httpClient.delete(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      req.token
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/{id}/items
router.post('/orders/:id/items', requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}/items`;
    const response = await httpClient.post(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/{orderId}/items/{itemId}
router.delete('/orders/:orderId/items/:itemId', requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.orderId}/items/${req.params.itemId}`;
    await httpClient.delete(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      req.token
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/{id}/confirm
router.patch('/orders/:id/confirm', requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}/confirm`;
    const response = await httpClient.patch(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/{id}/ship
router.patch('/orders/:id/ship', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}/ship`;
    const response = await httpClient.patch(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/{id}/deliver
router.patch('/orders/:id/deliver', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}/deliver`;
    const response = await httpClient.patch(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/{id}/cancel
router.patch('/orders/:id/cancel', async (req, res, next) => {
  try {
    const path = `/api/orders/${req.params.id}/cancel`;
    const response = await httpClient.patch(
      config.services.orderService.name,
      config.services.orderService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * SUPPLIER SERVICE ROUTES (Port 8084)
 */
// GET /api/suppliers
router.get('/suppliers', async (req, res, next) => {
  try {
    const path = `/api/suppliers${req.url.split('/suppliers')[1] || ''}`;
    const response = await httpClient.get(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers
router.post('/suppliers', async (req, res, next) => {
  try {
    const response = await httpClient.post(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      '/api/suppliers',
      req.body,
      req.token
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/suppliers/{id}
router.get('/suppliers/:id', async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}`;
    const response = await httpClient.get(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/suppliers/{id}
router.put('/suppliers/:id', async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}`;
    const response = await httpClient.put(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.body,
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/suppliers/{id}
router.delete('/suppliers/:id', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}`;
    await httpClient.delete(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.token
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers/{id}/approve
router.post('/suppliers/:id/approve', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}/approve`;
    const response = await httpClient.post(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers/{id}/reject
router.post('/suppliers/:id/reject', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}/reject`;
    const response = await httpClient.post(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.body || {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/suppliers/{id}/suspend
router.patch('/suppliers/:id/suspend', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}/suspend`;
    const response = await httpClient.patch(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      req.body || {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/suppliers/{id}/activate
router.patch('/suppliers/:id/activate', requireRole('DATA_STEWARD'), async (req, res, next) => {
  try {
    const path = `/api/suppliers/${req.params.id}/activate`;
    const response = await httpClient.patch(
      config.services.supplierService.name,
      config.services.supplierService.baseUrl,
      path,
      {},
      req.token
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
