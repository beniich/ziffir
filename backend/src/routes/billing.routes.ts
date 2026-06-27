import { Router, raw, json } from 'express';
import Stripe from 'stripe';
import { BillingController } from '../controllers/billing.controller';
import { StripeService } from '../services/stripe.service';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

const router = Router();

/**
 * ⚠️ CRITIQUE : Cette route doit être montée AVANT express.json()
 * car elle a besoin du raw body pour vérifier la signature Stripe.
 */
router.post('/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      logger.warn({}, 'Webhook sans signature');
      return res.status(400).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      logger.error({ err: err.message }, 'Webhook signature verification failed');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await StripeService.handleWebhook(event);
      res.json({ received: true });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Webhook handler failed');
      res.status(500).json({ error: 'Handler failed' });
    }
  }
);

// ⚠️ Ces routes nécessitent json() car le routeur est monté avant le parseur global
router.post('/create-checkout', json(), requireAuth, BillingController.createCheckout);
router.get('/verify-session', requireAuth, BillingController.verifySession); // GET req has no body
router.post('/portal', json(), requireAuth, BillingController.createPortal);
router.get('/subscription', requireAuth, BillingController.getSubscription);
router.get('/usage', requireAuth, BillingController.getUsage);

export default router;
