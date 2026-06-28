import { Router } from 'express';
import { getSegments } from '../controllers/segmentation.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'MANAGER'));

router.get('/', getSegments);

export default router;
