import { Request, Response, NextFunction } from 'express';
import { HotelContextService } from '../services/hotel-context.service';
import { AppError } from './errorHandler';

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError(401, 'Non authentifié');
      }

      if (user.globalRole === 'SUPER_ADMIN') {
        return next();
      }

      const activeHotelId = user.activeHotelId;
      if (!activeHotelId) {
        throw new AppError(403, 'Aucun hôtel actif sélectionné');
      }

      const { permissions } = await HotelContextService.getEffectivePermissions(user.userId, activeHotelId);

      if (!permissions.has(permission)) {
        throw new AppError(403, `Permission refusée: ${permission} requise`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
