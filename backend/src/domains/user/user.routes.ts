import { Router } from 'express';
import * as ctrl from './user.controller.js';
import { apiLimiter, strictLimiter } from '../shared/middleware/rate-limiter.middleware.js';
import { attachUser } from '../identity/auth/auth.middleware.js';

const router = Router();
router.use(attachUser);
router.use(apiLimiter);

// ===== Self endpoints (any authenticated user) =====
router.get('/me/profile', ...ctrl.getProfile);
router.patch('/me/profile', ...ctrl.updateProfile);
router.post('/me/change-password', strictLimiter, ...ctrl.changeMyPassword);

// ===== Admin management endpoints =====
router.get('/', ...ctrl.list);
router.post('/', strictLimiter, ...ctrl.create);
router.get('/:id', ...ctrl.getById);
router.patch('/:id', ...ctrl.update);
router.delete('/:id', strictLimiter, ...ctrl.deactivate);
router.patch('/:id/role', strictLimiter, ...ctrl.changeRole);
router.post('/:id/reset-password', strictLimiter, ...ctrl.resetPassword);
router.patch('/:id/toggle-active', strictLimiter, ...ctrl.toggleActive);

export { router as userRouter };
