import { Router } from 'express';
import * as ctrl from './hotel.controller.js';
import { apiLimiter } from '../shared/middleware/rate-limiter.middleware.js';
import { attachUser } from '../identity/auth/auth.middleware.js';

const router = Router();
router.use(attachUser);
router.use(apiLimiter);

// ===== Self endpoints (any authenticated user) =====
router.get('/me', ...ctrl.getMe);
router.patch('/me', ...ctrl.updateMe);
router.patch('/me/settings', ...ctrl.updateMySettings);
router.get('/me/stats', ...ctrl.getMyStats);

// ===== SUPER_ADMIN endpoints =====
router.post('/', ...ctrl.create);
router.get('/', ...ctrl.list);
router.get('/:id', ...ctrl.getById);
router.patch('/:id', ...ctrl.update);
router.delete('/:id', ...ctrl.deactivate);
router.post('/:id/reactivate', ...ctrl.reactivate);

export { router as hotelRouter };
