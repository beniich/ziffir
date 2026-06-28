import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../shared/errors/errorHandler.js';

const PLAN_HIERARCHY: Record<string, number> = {
  FREE_TRIAL: 1,
  FREE: 1,
  PREMIUM: 2,
  PLATINIUM: 3,
  GOLDEN: 4,
};

export const MODULE_MIN_PLAN: Record<string, string> = {
  'portal.view': 'FREE',
  'profile.view': 'FREE',
  'room_service.view': 'FREE',
  'room_service.create': 'FREE',
  
  'arrivals.view': 'PREMIUM',
  'arrivals.check_in': 'PREMIUM',
  'maintenance.view': 'PREMIUM',
  'maintenance.create': 'PREMIUM',
  'ledger.view': 'PREMIUM',
  'hospitality.view': 'PREMIUM',
  'wine_cellar.view': 'PREMIUM',
  'memberships.view': 'PREMIUM',
  
  'controls.view': 'PLATINIUM',
  'controls.edit': 'PLATINIUM',
  'wine_cellar.edit': 'PLATINIUM',
  'hospitality.edit': 'PLATINIUM',
  'omni_stream.view': 'PLATINIUM',
  
  'vault.view': 'GOLDEN',
  'vault.edit': 'GOLDEN',
  'channel_sync.view': 'GOLDEN',
  'channel_sync.edit': 'GOLDEN',
  'user_directory.view': 'GOLDEN',
  'management.view': 'GOLDEN',
};

export function requireModule(module: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const tenant = req.tenant;
    
    if (!tenant) {
      return next(new ApiError(500, 'requireModule() doit être appelé après requireTenant'));
    }

    if (tenant.trialActive) {
      return next();
    }

    if (tenant.trialExpired) {
      const ALLOWED_DURING_EXPIRED = ['billing.view', 'profile.view', 'profile.edit'];
      if (ALLOWED_DURING_EXPIRED.includes(module)) {
        return next();
      }
      return next(new ApiError(402, 'Votre essai gratuit a expiré. Souscrivez pour continuer.'));
    }

    const requiredPlan = MODULE_MIN_PLAN[module];
    if (!requiredPlan) {
      return next();
    }

    const currentLevel = PLAN_HIERARCHY[tenant.plan] ?? 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan];

    if (currentLevel < requiredLevel) {
      return next(new ApiError(402, `Le module "${module}" nécessite le plan ${requiredPlan}`));
    }

    next();
  };
}
