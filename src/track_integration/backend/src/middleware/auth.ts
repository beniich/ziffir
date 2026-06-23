import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';

// Extend Express Request type to attach decoded user state
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware validating bearer tokens in Authorization headers
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      message: 'Access denied. Missing valid Bearer session token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded; // attach credentials payload to active request context
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS_SIGNATURE',
      message: 'Active signature expired or compromised. Authenticate session again.'
    });
  }
}

/**
 * Middleware ensuring current user possesses sovereign clearance (MANAGER role)
 */
export function requireManager(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'MANAGER') {
    return res.status(403).json({
      error: 'INSUFFICIENT_SECURITY_CLEARANCE',
      message: 'Requires Level 5 (MANAGER) credentials elevation to bypass restriction.'
    });
  }
  next();
}
