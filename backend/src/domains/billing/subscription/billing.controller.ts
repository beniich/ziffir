/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { stripe, isStripeMock } from '../../../infrastructure/payment/stripe.client.js';
import { env } from '../../../config/env.js';
import { computeCommissions, attributeReferral } from '../../../services/affiliate.service.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { ApiError } from '../../../shared/errors/errorHandler.js';

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
        const planMeta = (session.metadata?.plan || 'STARTER').toUpperCase();
        
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          create: {
            hotelId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            plan: planMeta.toLowerCase(),
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

        // Mise à jour du plan de l'hôtel dans la base de données
        let hotelPlan: 'PREMIUM' | 'PLATINIUM' | 'GOLDEN' | 'FREE_TRIAL' = 'PREMIUM';
        if (planMeta === 'STARTER' || planMeta === 'PREMIUM') {
          hotelPlan = 'PREMIUM';
        } else if (planMeta === 'PROFESSIONAL' || planMeta === 'PRO' || planMeta === 'PLATINIUM') {
          hotelPlan = 'PLATINIUM';
        } else if (planMeta === 'ENTERPRISE' || planMeta === 'GOLDEN') {
          hotelPlan = 'GOLDEN';
        }

        await prisma.hotel.update({
          where: { id: hotelId },
          data: { 
            plan: hotelPlan,
            trialEndsAt: null, // Fin de l'essai une fois abonné
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

export const createBillingCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Non authentifié');
  }

  const hotelId = req.user.activeHotelId || req.user.hotelId;
  if (!hotelId) {
    throw new ApiError(400, 'Aucun hôtel associé à cet utilisateur');
  }

  const schema = z.object({
    planKey: z.string(),
    billing: z.enum(['monthly', 'annual']),
    successUrl: z.string().optional(),
    cancelUrl: z.string().optional(),
  });

  const body = req.body;
  const input = {
    planKey: body.planKey || body.planId,
    billing: body.billing || body.interval,
    successUrl: body.successUrl,
    cancelUrl: body.cancelUrl,
  };

  const { planKey, billing, successUrl, cancelUrl } = schema.parse(input);
  const normalizedPlan = planKey.toUpperCase();

  if (normalizedPlan === 'TRIAL') {
    throw new ApiError(400, 'Le plan d\'essai (Trial) ne requiert pas de paiement.');
  }

  let pricePerMonth = 0;
  if (normalizedPlan === 'STARTER') {
    pricePerMonth = billing === 'annual' ? 79 : 99;
  } else if (normalizedPlan === 'PROFESSIONAL' || normalizedPlan === 'PRO') {
    pricePerMonth = billing === 'annual' ? 239 : 299;
  } else if (normalizedPlan === 'ENTERPRISE') {
    pricePerMonth = billing === 'annual' ? 799 : 999;
  } else {
    throw new ApiError(400, `Plan inconnu : ${planKey}`);
  }

  const amountCents = billing === 'annual' ? pricePerMonth * 12 * 100 : pricePerMonth * 100;
  
  const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
  const defaultSuccessUrl = `${origin}/checkout/success?plan=${normalizedPlan}`;
  const defaultCancelUrl = `${origin}/checkout/cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Abonnement Ziffir - ${normalizedPlan} (${billing === 'annual' ? 'Annuel' : 'Mensuel'})`,
          },
          unit_amount: amountCents,
          recurring: {
            interval: billing === 'annual' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      hotelId,
      plan: normalizedPlan,
      interval: billing,
    },
    client_reference_id: hotelId,
    success_url: successUrl || defaultSuccessUrl,
    cancel_url: cancelUrl || defaultCancelUrl,
  });

  res.json({ id: session.id, url: session.url });
});
