import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireRole } from '../middleware/auth';
import { readLimiter, writeLimiter } from '../config/rateLimit';

const router = Router();

// 🔐 Réservé SUPER_ADMIN uniquement (ISO 27001 A.9.2.3)
router.get('/',                  requireRole('SUPER_ADMIN'), readLimiter,  UserController.list);
router.patch('/:id',             requireRole('SUPER_ADMIN'), writeLimiter, UserController.update);
router.patch('/:id/deactivate',  requireRole('SUPER_ADMIN'), writeLimiter, UserController.deactivate);

export default router;

