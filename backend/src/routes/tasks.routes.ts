import { Router } from 'express';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';
import * as ctrl from '../controllers/tasks.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.listTasks);
router.get('/:id', ctrl.getTask);
router.post('/', ctrl.createTask);
router.patch('/:id', ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

export default router;
