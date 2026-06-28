import { Router } from 'express';
import * as ctrl from '../domains/billing/invoice/invoices.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.listInvoices);
router.get('/:id', ctrl.getInvoice);
router.get('/:id/pdf', ctrl.downloadInvoicePDF);

router.post('/', requireRole('ADMIN', 'MANAGER', 'STAFF'), ctrl.createInvoice);
router.post('/:id/issue', requireRole('ADMIN', 'MANAGER'), ctrl.issueInvoiceHandler);
router.post('/:id/checkout', ctrl.createCheckoutSession);
router.post('/:id/payments', requireRole('ADMIN', 'MANAGER', 'STAFF'), ctrl.recordPayment);

export default router;
