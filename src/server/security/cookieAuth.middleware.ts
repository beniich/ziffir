import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.zafir_access_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing authentication credentials.' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback-secret-for-dev'
    ) as any;

    (req as any).auth = {
      sub: decoded.sub,
      role: decoded.role,
      activeHotelId: decoded.activeHotelId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token.' });
  }
};
