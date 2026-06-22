import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { requireRole } from '../middleware/auth';
import { readLimiter, writeLimiter } from '../config/rateLimit';

const router = Router();

// 🔐 Réservé SUPER_ADMIN uniquement (ISO 27001 A.9.2.3)
router.get('/',        requireRole('SUPER_ADMIN'), readLimiter,  HotelController.list);
router.post('/',       requireRole('SUPER_ADMIN'), writeLimiter, HotelController.create);
router.patch('/:id',   requireRole('SUPER_ADMIN'), writeLimiter, HotelController.update);
router.delete('/:id',  requireRole('SUPER_ADMIN'), writeLimiter, HotelController.deactivate);

export default router;

