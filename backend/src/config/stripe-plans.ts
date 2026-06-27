export type PlanKey = 'FREE' | 'PREMIUM' | 'PLATINIUM' | 'GOLDEN';

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    // PAS de priceId Stripe → géré en interne uniquement
    limits: {
      rooms: 3,
      staff: 2,
      apiCallsPerMonth: 1000,
    },
    features: ['Dashboard basique', 'Email support'],
  },
  PREMIUM: {
    name: 'Premium',
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    monthlyPrice: 49,
    limits: {
      rooms: 20,
      staff: 10,
      apiCallsPerMonth: 10_000,
    },
    features: ['Toutes Free', 'Room Service', 'Vault (5 docs)'],
  },
  PLATINIUM: {
    name: 'Platinium',
    priceId: process.env.STRIPE_PRICE_PLATINIUM,
    monthlyPrice: 149,
    limits: {
      rooms: 100,
      staff: 50,
      apiCallsPerMonth: 100_000,
    },
    features: ['Toutes Premium', 'Analytics', 'AI Sommelier'],
  },
  GOLDEN: {
    name: 'Golden',
    priceId: process.env.STRIPE_PRICE_GOLDEN,
    monthlyPrice: 499,
    limits: {
      rooms: -1,  // Illimité
      staff: -1,
      apiCallsPerMonth: -1,
    },
    features: ['Toutes Platinium', 'Multi-hôtels', 'SLA 99.99%'],
  },
};
