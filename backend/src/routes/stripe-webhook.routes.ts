import { Router, raw } from 'express';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe.service';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const router = Router();

/**
 * POST /api/billing/webhook
 * ⚠️ DOIT être monté AVANT express.json() pour recevoir le raw body
 */
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    logger.warn('Webhook sans signature Stripe');
    res.status(400).send('Missing signature');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    await StripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
