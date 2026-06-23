"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_PLANS = void 0;
/**
 * Configuration des plans tarifaires Zaphir.
 * Synchronisez les priceId avec votre dashboard Stripe.
 */
exports.STRIPE_PLANS = {
    TRIAL: {
        name: 'Trial',
        priceId: null, // Pas de prix Stripe pour le trial
        monthlyPrice: 0,
        trialDays: 14,
        limits: {
            rooms: 5,
            staff: 2,
            apiCallsPerMonth: 1000,
            storageGb: 1,
        },
        features: [
            'Dashboard basique',
            'Room Service (limité)',
            'Support email',
        ],
    },
    STARTER: {
        name: 'Starter',
        priceId: process.env.STRIPE_PRICE_STARTER,
        monthlyPrice: 99,
        limits: {
            rooms: 20,
            staff: 5,
            apiCallsPerMonth: 10_000,
            storageGb: 5,
        },
        features: [
            'Dashboard basique',
            'Room Service illimité',
            'Coffre-fort (5 docs)',
            'Support email 48h',
        ],
    },
    PROFESSIONAL: {
        name: 'Professional',
        priceId: process.env.STRIPE_PRICE_PRO,
        monthlyPrice: 299,
        limits: {
            rooms: 100,
            staff: 25,
            apiCallsPerMonth: 100_000,
            storageGb: 50,
        },
        features: [
            'Analytics avancés',
            'ML Predictions',
            'AI Chatbot',
            'Vault biométrique',
            'Support prioritaire 24h',
        ],
        popular: true,
    },
    ENTERPRISE: {
        name: 'Enterprise',
        priceId: process.env.STRIPE_PRICE_ENT,
        monthlyPrice: 999,
        limits: {
            rooms: -1, // illimité
            staff: -1,
            apiCallsPerMonth: -1,
            storageGb: 500,
        },
        features: [
            'Multi-région',
            'SLA 99.99%',
            'Account manager dédié',
            'Custom integrations',
            'On-site training',
        ],
    },
};
//# sourceMappingURL=stripe-plans.js.map