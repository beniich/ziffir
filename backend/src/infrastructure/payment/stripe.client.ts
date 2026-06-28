/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import Stripe from 'stripe';
import { env } from '../../config/env.js';

const isMockMode = env.STRIPE_MOCK_MODE === 'true';

export const stripe = isMockMode
  ? (createMockStripe() as any)
  : new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: env.STRIPE_API_VERSION as any,
      typescript: true,
    });

export const isStripeMock = isMockMode;

/**
 * Mock minimal de Stripe pour dev/tests.
 * Simule les réponses réelles.
 */
function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: async (params: any) => ({
          id: `cs_mock_${Date.now()}`,
          url: `http://localhost:5000/mock-stripe/checkout?session_id=cs_mock_${Date.now()}&amount=${params.line_items?.[0]?.price_data?.unit_amount}&success_url=${encodeURIComponent(params.success_url || '')}`,
          payment_intent: `pi_mock_${Date.now()}`,
          status: 'open',
        }),
        retrieve: async (id: string) => ({
          id,
          payment_status: 'paid',
          payment_intent: `pi_mock_${id}`,
          amount_total: 10000,
          customer_email: 'mock@example.com',
        }),
      },
    },
    paymentIntents: {
      create: async (params: any) => ({
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: params.amount,
        currency: params.currency,
        status: 'requires_payment_method',
      }),
      retrieve: async (id: string) => ({
        id,
        amount: 10000,
        currency: 'eur',
        status: 'succeeded',
        charges: { data: [{ id: `ch_mock_${id}`, receipt_url: null }] },
      }),
    },
    webhooks: {
      constructEvent: (payload: any, signature: string, secret: string) => {
        // En mock, on fait confiance au payload
        return typeof payload === 'string' ? JSON.parse(payload) : payload;
      },
    },
  };
}
