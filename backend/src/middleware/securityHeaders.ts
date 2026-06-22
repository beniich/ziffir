import { Request, Response, NextFunction } from 'express';

/**
 * Middleware applicatif pour headers de sécurité spécifiques non couverts par Helmet.
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Cache Control strict pour les API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Empêcher l'exécution de Flash et autres plugins legacy
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
};
