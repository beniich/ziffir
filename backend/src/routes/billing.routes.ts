import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { writeLimiter, readLimiter } from '../config/rateLimit';

const router = Router();

// Routes publiques
router.get('/plans', readLimiter, BillingController.listPlans);

// Routes protégées (manager+)
router.get('/subscription', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), BillingController.getSubscription);
router.get('/usage', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), BillingController.getUsage);
router.post('/checkout', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), writeLimiter, BillingController.createCheckout);
router.post('/portal', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), BillingController.createPortal);
router.get('/invoices', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), BillingController.listInvoices);
router.post('/cancel', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), writeLimiter, BillingController.cancel);
router.post('/resume', requireAuth, requireRole('HOTEL', 'SUPER_ADMIN'), writeLimiter, BillingController.resume);

export default router;
