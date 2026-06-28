import type { Request, Response } from 'express';
import { z } from 'zod';
import { anonymizeGuest } from './anonymize.service.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { requireAuth, requireRole } from '../../identity/auth/auth.middleware.js';

const requestSchema = z.object({
  reason: z.string().min(10).max(500),
  confirm: z.literal(true), // doit explicitement confirmer
});

export const requestAnonymization = [
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { reason, confirm } = requestSchema.parse(req.body);
    
    if (!confirm) {
      return res.status(400).json({ 
        error: 'Confirmation required',
        message: 'You must confirm anonymization by setting confirm: true',
      });
    }
    
    const result = await anonymizeGuest(req.params.id, req.user!.hotelId, reason, req);
    
    res.json({
      message: 'Guest anonymized successfully (RGPD Article 17)',
      anonymizedId: result.guest.id,
      auditRef: result.auditEventId,
    });
  }),
];
