import type { Request, Response } from 'express';
import { z } from 'zod';
import { 
  createGuest, 
  updateGuest, 
  getGuestDecrypted, 
  listGuestsDecrypted, 
  findGuestByDocument,
  maskGuestPII,
} from './guest.service.js';
import { logAudit } from '../../audit/audit.service.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { requireAuth, requireRole } from '../../identity/auth/auth.middleware.js';

const createSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  documentType: z.enum(['PASSPORT', 'ID_CARD', 'DRIVING_LICENSE']).optional(),
  documentNumber: z.string().optional(),
  vip: z.boolean().default(false),
  preferences: z.string().optional(),
});

export const create = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const data = createSchema.parse(req.body);
    const hotelId = req.user!.hotelId;
    const guest = await createGuest(hotelId, data as any, req);
    res.status(201).json({ guest: maskGuestPII(guest) });
  }),
];

export const list = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.user!.hotelId;
    const { search, vip, page, pageSize } = req.query;
    
    const { items, total } = await listGuestsDecrypted(hotelId, {
      search: search as string,
      vip: vip === 'true' ? true : vip === 'false' ? false : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    
    res.json({
      guests: items.map(maskGuestPII),
      total,
    });
  }),
];

export const get = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const hotelId = req.user!.hotelId;
    // 🔒 Seuls ADMIN et MANAGER voient les PII en clair
    const canSeePII = req.user!.role === 'ADMIN' || req.user!.role === 'MANAGER';
    
    const guest = await getGuestDecrypted(req.params.id, hotelId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    
    // 🔒 Log accès aux PII
    if (canSeePII) {
      await logAudit({
        actor: req.user!.userId,
        action: 'guest.pii_accessed',
        resource: 'guest',
        resourceId: req.params.id,
        metadata: { reason: 'viewed_full_profile' },
      }, req);
    }
    
    res.json({ guest: canSeePII ? guest : maskGuestPII(guest) });
  }),
];

export const update = [
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = createSchema.partial().parse(req.body);
    const hotelId = req.user!.hotelId;
    const guest = await updateGuest(req.params.id, hotelId, data, req);
    res.json({ guest: maskGuestPII(guest) });
  }),
];

export const searchByDocument = [
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'STAFF'),
  asyncHandler(async (req: Request, res: Response) => {
    const { documentNumber } = z.object({ documentNumber: z.string() }).parse(req.query);
    const hotelId = req.user!.hotelId;
    
    const guest = await findGuestByDocument(hotelId, documentNumber);
    if (!guest) return res.status(404).json({ error: 'No guest found' });
    
    // 🔒 Log accès par document (sensible)
    await logAudit({
      actor: req.user!.userId,
      action: 'guest.searched_by_document',
      resource: 'guest',
      metadata: { documentType: guest.documentType },
    }, req);
    
    res.json({ guest: maskGuestPII(guest) });
  }),
];
