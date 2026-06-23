import { Request, Response, NextFunction } from 'express';

/**
 * Empty validation helper pass-through for development
 */
export const validate = (_schema: any) => (req: Request, res: Response, next: NextFunction) => {
  next();
};

export const schemas = {
  createOrder: {}
};
