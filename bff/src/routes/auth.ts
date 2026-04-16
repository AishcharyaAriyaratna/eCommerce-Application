import { Router, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

interface AuthRequest extends Request {
  user?: any;
  accessToken?: string;
}

const router = Router();

// Local users for development (in production, this would come from a database)
const LOCAL_USERS = {
  customer1: { username: 'customer1', role: 'Customer', email: 'customer1@example.com' },
  customer2: { username: 'customer2', role: 'Customer', email: 'customer2@example.com' },
  supplier1: { username: 'supplier1', role: 'Supplier', email: 'supplier1@example.com' },
  supplier2: { username: 'supplier2', role: 'Supplier', email: 'supplier2@example.com' },
  steward1: { username: 'steward1', role: 'Data Steward', email: 'steward1@example.com' },
  steward2: { username: 'steward2', role: 'Data Steward', email: 'steward2@example.com' },
};

/**
 * POST /auth/login
 * Local authentication for development
 * Body: { username: string, role: string }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, role } = req.body;

    if (!username || !role) {
      return res.status(400).json({ error: 'Username and role are required' });
    }

    const user = LOCAL_USERS[username as keyof typeof LOCAL_USERS];
    if (!user || user.role !== role) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const secret = process.env.JWT_SECRET || 'local-development-secret';
    const expiresIn = '1h';

    const idTokenPayload = {
      sub: user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      email_verified: true,
      iss: 'local-auth',
      aud: 'ecommerce-platform',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    const accessTokenPayload = {
      sub: user.username,
      username: user.username,
      role: user.role,
      iss: 'local-auth',
      aud: 'ecommerce-platform',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const id_token = jwt.sign(idTokenPayload, secret);
    const access_token = jwt.sign(accessTokenPayload, secret);
    const refresh_token = jwt.sign({ sub: user.username }, secret, { expiresIn: '7d' });

    res.json({
      access_token,
      id_token,
      refresh_token,
      expires_in: 3600,
      token_type: 'Bearer',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 * Requires: Authentication
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      user: req.user,
      role: req.user?.role,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /auth/roles
 * Get current user roles
 * Requires: Authentication
 */
router.get('/roles', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      role: req.user?.role,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

export default router;
