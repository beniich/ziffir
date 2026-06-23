"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("../controllers/billing.controller");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../config/rateLimit");
const router = (0, express_1.Router)();
// Routes publiques
router.get('/plans', rateLimit_1.readLimiter, billing_controller_1.BillingController.listPlans);
// Routes protégées (manager+)
router.get('/subscription', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), billing_controller_1.BillingController.getSubscription);
router.get('/usage', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), billing_controller_1.BillingController.getUsage);
router.post('/checkout', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), rateLimit_1.writeLimiter, billing_controller_1.BillingController.createCheckout);
router.post('/portal', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), billing_controller_1.BillingController.createPortal);
router.get('/invoices', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), billing_controller_1.BillingController.listInvoices);
router.post('/cancel', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), rateLimit_1.writeLimiter, billing_controller_1.BillingController.cancel);
router.post('/resume', auth_1.requireAuth, (0, auth_1.requireRole)('HOTEL', 'SUPER_ADMIN'), rateLimit_1.writeLimiter, billing_controller_1.BillingController.resume);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map