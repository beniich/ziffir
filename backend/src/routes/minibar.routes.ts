import { Router } from 'express';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';
import * as ctrl from '../controllers/minibar.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.listMinibarItems);
router.get('/:id', ctrl.getMinibarItem);
router.post('/', ctrl.createMinibarItem);
router.patch('/:id', ctrl.updateMinibarItem);
router.delete('/:id', ctrl.deleteMinibarItem);

export default router;
