import { Router } from 'express';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';
import {
  getSuperDashboard,
  listAllHotels,
  createHotel,
  updateHotel,
  archiveHotel,
  getHotelStats,
} from '../controllers/super.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', ...getSuperDashboard);
router.get('/hotels', ...listAllHotels);
router.post('/hotels', ...createHotel);
router.patch('/hotels/:id', ...updateHotel);
router.post('/hotels/:id/archive', ...archiveHotel);
router.get('/hotels/:id/stats', ...getHotelStats);

export default router;
