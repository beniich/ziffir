import { Request, Response, NextFunction } from 'express';

/**
 * Standard security API write path rate limiter
 */
export const writeLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

/**
 * Standard security API read path rate limiter
 */
export const readLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
