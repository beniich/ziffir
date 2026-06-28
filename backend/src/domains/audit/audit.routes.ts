import { Router } from 'express';
import * as ctrl from './audit.controller.js';
import { requireAuth } from '../identity/auth/auth.middleware.js';
import { requireRole } from '../identity/rbac/rbac.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/', ctrl.listEvents);
router.get('/export', ctrl.exportEvents);
router.get('/verify', ctrl.verifyIntegrity);
router.get('/:id', ctrl.getEvent);

export default router;
