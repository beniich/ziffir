import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../domains/billing/subscription/billing.controller.js';

const router = Router();

// Endpoint webhook Stripe nécessite le raw body pour la vérification de signature
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
