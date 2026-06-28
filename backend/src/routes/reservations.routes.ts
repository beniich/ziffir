import { Router } from 'express';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';
import {
  listReservations,
  getCalendar,
  getReservation,
  createReservation,
  updateReservation,
  confirmReservation,
  checkIn,
  checkOut,
  cancelReservation,
  getReservationStats,
} from '../domains/hotel/reservation/reservation.controller.js';

const router = Router();

router.use(requireAuth);

// Stats + calendar (avant :id pour éviter les conflits)
router.get('/stats', getReservationStats);
router.get('/calendar', getCalendar);

// CRUD
router.get('/', listReservations);
router.get('/:id', getReservation);
router.post('/', createReservation);
router.patch('/:id', updateReservation);

// Transitions de statut
router.post('/:id/confirm', confirmReservation);
router.post('/:id/check-in', checkIn);
router.post('/:id/check-out', checkOut);
router.post('/:id/cancel', cancelReservation);

export default router;
