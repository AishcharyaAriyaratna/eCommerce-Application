/**
 * Authentication Controller
 * Handles login, user info, and role retrieval
 */

const { generateToken } = require('../utils/jwtHelper');
const config = require('../config');

/**
 * User login endpoint
 * Authenticates user credentials and returns JWT token
 */
function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Username and password are required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user in test users (in production, query database)
    const user = config.testUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid username or password',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate JWT token
    const accessToken = generateToken(user);

    // Return token and user info
    return res.status(200).json({
      accessToken,
      expiresIn: '1h',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user information
 * Returns user info from JWT token
 */
function getCurrentUser(req, res, next) {
  try {
    const user = req.user;

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get available roles
 * Returns list of all available roles for the system
 */
function getRoles(req, res, next) {
  try {
    const roles = ['CUSTOMER', 'SUPPLIER', 'DATA_STEWARD'];

    return res.status(200).json({
      roles,
      descriptions: {
        CUSTOMER: 'Can browse products and create orders',
        SUPPLIER: 'Can register, create and manage products',
        DATA_STEWARD: 'Can approve products, suppliers, and manage users',
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getCurrentUser,
  getRoles,
};
