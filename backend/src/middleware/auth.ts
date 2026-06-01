import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'buildrx_fallback_jwt_secret_key_12345';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      plan: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Enterprise/PRO can be mapped or we can use a dedicated role.
  // For standard multi-tenant SaaS admin, we can support an environment check for specific emails or a PLAN check.
  // Let's check if user's plan is 'ENTERPRISE' or if their email matches a predefined system superadmin email
  const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@buildrx.com';
  if (req.user.email !== superAdminEmail && req.user.plan !== 'ENTERPRISE') {
    return res.status(403).json({ error: 'Access denied: Superadmin privileges required' });
  }

  next();
};
