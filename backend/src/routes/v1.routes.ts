import { Router } from 'express';
import { requireApiKey, requireScope } from '../domains/identity/auth/api-key.middleware.js';

// Import existing controllers
import * as reservationsCtrl from '../domains/hotel/reservation/reservation.controller.js';
import * as invoicesCtrl from '../domains/billing/invoice/invoices.controller.js';
import * as roomsCtrl from '../domains/hotel/room/room.controller.js';

const router = Router();

// L'API V1 nécessite une ApiKey valide
router.use(requireApiKey);

// ─── Reservations ──────────────────────────────────────────────
router.get('/reservations', requireScope('reservations:read'), reservationsCtrl.listReservations);
router.post('/reservations', requireScope('reservations:write'), reservationsCtrl.createReservation);
router.get('/reservations/:id', requireScope('reservations:read'), reservationsCtrl.getReservation);
router.post('/reservations/:id/cancel', requireScope('reservations:write'), reservationsCtrl.cancelReservation);

// ─── Invoices ──────────────────────────────────────────────────
router.get('/invoices', requireScope('invoices:read'), invoicesCtrl.listInvoices);
router.get('/invoices/:id', requireScope('invoices:read'), invoicesCtrl.getInvoice);
router.post('/invoices', requireScope('invoices:write'), invoicesCtrl.createInvoice);
router.post('/invoices/:id/payments', requireScope('invoices:write'), invoicesCtrl.recordPayment);

// ─── Rooms ─────────────────────────────────────────────────────
router.get('/rooms', requireScope('rooms:read'), roomsCtrl.listRooms);
router.get('/rooms/:id', requireScope('rooms:read'), roomsCtrl.getRoom);
// On pourrait imaginer un endpoint pour changer le statut d'une chambre (nettoyée, etc.)

export default router;
