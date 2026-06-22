import { Request, Response, NextFunction } from 'express';

/**
 * Erreur applicative typée (avec status HTTP).
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 404 handler — à placer APRÈS toutes les routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} introuvable`,
  });
};

/**
 * Error handler global — à placer en DERNIER dans app.ts.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log structuré
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    userId: (req as any).user?.userId,
  });

  // Erreur applicative typée
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Erreurs Prisma connues
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Cette valeur existe déjà (contrainte d\'unicité)' });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Ressource introuvable' });
      return;
    }
  }

  // Erreurs Zod
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: (err as any).errors,
    });
    return;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
    return;
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur interne'
      : err.message,
  });
};

/**
 * Wrapper pour les controllers async (évite try/catch répétés).
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
