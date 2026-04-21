/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

const { verifyToken, extractToken } = require('../utils/jwtHelper');
const { APIError } = require('../utils/errorHandler');

/**
 * Middleware to verify JWT token
 * Checks Authorization header and validates token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Missing authorization token',
        timestamp: new Date().toISOString(),
      },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Attach decoded token to request
  req.user = decoded;
  req.token = token;
  next();
}

/**
 * Middleware to check user role
 * @param {...string} allowedRoles - Roles that are allowed
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          status: 403,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};
