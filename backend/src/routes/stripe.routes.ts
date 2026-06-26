import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../server';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planKey, billing, userId, successUrl, cancelUrl } = req.body;

    if (!planKey) {
      return res.status(400).json({ error: 'Missing planKey' });
    }

    let priceId = '';
    if (planKey === 'starter') priceId = process.env.STRIPE_PRICE_STARTER || '';
    else if (planKey === 'pro') priceId = process.env.STRIPE_PRICE_PRO || '';
    else if (planKey === 'enterprise') priceId = process.env.STRIPE_PRICE_ENT || '';

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan or Stripe price not configured' });
    }

    let customerId: string | undefined = undefined;
    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (user) {
      customerId = user.stripeCustomerId || undefined;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/dashboard`,
      client_reference_id: userId || undefined,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe Customer not found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret as string);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.client_reference_id) {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          await prisma.user.update({
            where: { id: session.client_reference_id },
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
          console.log(`✅ Subscribed User ${session.client_reference_id}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        console.log(`✅ Updated Subscription ${subscription.id}`);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        });
        console.log(`❌ Canceled Subscription ${subscription.id}`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  } catch (err: any) {
    console.error('Error handling webhook event:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
