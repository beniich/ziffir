/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { stripe, isStripeMock } from '../../../infrastructure/payment/stripe.client.js';
import { env } from '../../../config/env.js';
import { computeCommissions, attributeReferral } from '../../../services/affiliate.service.js';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Assurez-vous que express.raw() est utilisé pour ce endpoint
      sig,
      env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Récupération du code d'affiliation passé via le checkout
      const refCode = session.client_reference_id || session.metadata?.ref;
      const hotelId = session.metadata?.hotelId;

      if (refCode && hotelId) {
        await attributeReferral(hotelId, refCode, 'stripe_checkout');
      }

      // Si c'est un abonnement, créer le record Subscription
      if (session.subscription && hotelId) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const item = sub.items.data[0];
        
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          create: {
            hotelId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            plan: session.metadata?.plan || 'pro',
            interval: item.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
            status: sub.status,
            amountCents: item.price.unit_amount || 0,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          update: {
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          }
        });
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;
      
      if (invoice.subscription) {
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string }
        });

        if (sub) {
          // L'hôtel vient de payer son mois d'abonnement
          // -> Déclenchement de la commission d'affiliation
          await computeCommissions(sub.hotelId, invoice.amount_paid);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
