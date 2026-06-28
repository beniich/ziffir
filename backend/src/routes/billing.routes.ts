import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook, createBillingCheckoutSession } from '../domains/billing/subscription/billing.controller.js';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Endpoint webhook Stripe nécessite le raw body pour la vérification de signature
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Endpoint de Checkout pour l'abonnement SaaS de l'hôtel
router.post('/checkout', requireAuth, createBillingCheckoutSession);

export default router;
