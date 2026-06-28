import { Router } from 'express';
import { requireAuth, requireRole } from '../../identity/auth/auth.middleware.js';
import * as ctrl from './guest.controller.js';
import { requestAnonymization } from './anonymize.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/', requireRole('ADMIN', 'MANAGER', 'STAFF'), ctrl.create);
router.get('/', ctrl.list);
router.get('/search', requireRole('ADMIN', 'MANAGER', 'STAFF'), ctrl.searchByDocument);
router.get('/:id', ctrl.get);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), ctrl.update);
router.post('/:id/anonymize', requireRole('ADMIN'), requestAnonymization);

export default router;
