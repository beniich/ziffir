/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { Router } from 'express';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';
import * as ctrl from '../domains/hotel/room/room.controller.js';
import { auditMiddleware } from '../domains/audit/auto-audit.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.listRooms);
router.get('/:id', ctrl.getRoom);
router.post('/', requireRole('ADMIN', 'MANAGER'), ctrl.createRoom);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), ctrl.updateRoom);
router.delete('/:id', requireRole('ADMIN'), ctrl.deleteRoom);

export default router;
