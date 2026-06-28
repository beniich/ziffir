import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/metrics', ctrl.getMetrics);
router.get('/forecast', ctrl.getForecast);
router.get('/pricing', requireRole('ADMIN', 'MANAGER'), ctrl.getPricingRecommendations);

export default router;
