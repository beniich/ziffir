import { Request, Response, NextFunction } from 'express';
// Assumes you have a logger, using console for fallback if not
const logger = {
  warn: (obj: any, msg: string) => console.warn(msg, obj),
};

/**
 * Injecte automatiquement hotelId/userId selon le rôle.
 * Appliqué APRÈS requireAuth pour avoir accès à req.user.
 */
export const tenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ success: false, error: 'Non authentifié' });
    return;
  }

  switch (user.role) {
    case 'SUPER_ADMIN':
      // Super admin : pas d'injection automatique
      // Il peut spécifier hotelId librement via query/body
      break;

    case 'HOTEL':
      // Forcer hotelId dans toutes les requêtes
      if (!user.hotelId) {
        res.status(403).json({
          success: false,
          error: 'Compte hôtel sans hôtel associé. Contactez l\'administrateur.',
        });
        return;
      }

      // GET : injecter dans query
      if (req.method === 'GET') {
        req.query.hotelId = user.hotelId;
      }

      // POST/PUT/PATCH : injecter dans body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (req.body && typeof req.body === 'object') {
          // Ignorer toute tentative de bypass
          if (req.body.hotelId && req.body.hotelId !== user.hotelId) {
            logger.warn({
              userId: user.userId,
              attempted: req.body.hotelId,
              actual: user.hotelId,
              path: req.path,
            }, 'Tentative de bypass tenantIsolation');

            res.status(403).json({
              success: false,
              error: 'Tentative d\'accès à un autre hôtel détectée',
            });
            return;
          }
          req.body.hotelId = user.hotelId;
        }
      }
      break;

    case 'CLIENT':
      // Forcer guestId = userId
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        req.body.guestId = user.userId;
      }
      // Pour les GET : limiter aux commandes du client
      if (req.method === 'GET') {
        req.query.guestId = user.userId;
      }
      break;

    case 'VISITOR':
    default:
      res.status(403).json({ success: false, error: 'Accès non autorisé' });
      return;
  }

  next();
};
