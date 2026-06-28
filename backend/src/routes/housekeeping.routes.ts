import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';
import {
  listTasks,
  getTask,
  startTaskHandler,
  completeTaskHandler,
  inspectTaskHandler,
  createStayoverHandler,
  uploadPhotoHandler,
  getMyStats,
} from '../domains/hotel/housekeeping/housekeeping.controller.js';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const router = Router();

router.use(requireAuth);

router.get('/my-stats', getMyStats);
router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/stayover', requireRole('MANAGER', 'ADMIN'), createStayoverHandler);
router.post('/:id/start', startTaskHandler);
router.post('/:id/complete', completeTaskHandler);
router.post('/:id/inspect', requireRole('MANAGER', 'ADMIN'), inspectTaskHandler);
router.post('/:id/photo', upload.single('photo'), uploadPhotoHandler);

export default router;
