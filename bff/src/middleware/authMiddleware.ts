import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  email_verified: boolean;
  exp: number;
  iat: number;
}

interface AuthRequest extends Request {
  user?: TokenPayload;
  accessToken?: string;
}

/**
 * Middleware: Verify JWT token (local development)
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'local-development-secret';

    // Verify token
    const verified = jwt.verify(token, secret, {
      issuer: 'local-auth',
      audience: 'ecommerce-platform',
      algorithms: ['HS256'],
    }) as TokenPayload;

    // Attach user and token to request
    req.user = verified;
    req.accessToken = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Middleware: Require specific role
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userRole = req.user.role;
    const hasRole = roles.includes(userRole);

    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Middleware: Require authentication (no specific role)
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  next();
};

export default authMiddleware;
