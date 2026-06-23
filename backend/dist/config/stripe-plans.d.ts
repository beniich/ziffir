/**
 * Configuration des plans tarifaires Zaphir.
 * Synchronisez les priceId avec votre dashboard Stripe.
 */
export declare const STRIPE_PLANS: {
    readonly TRIAL: {
        readonly name: "Trial";
        readonly priceId: null;
        readonly monthlyPrice: 0;
        readonly trialDays: 14;
        readonly limits: {
            readonly rooms: 5;
            readonly staff: 2;
            readonly apiCallsPerMonth: 1000;
            readonly storageGb: 1;
        };
        readonly features: readonly ["Dashboard basique", "Room Service (limité)", "Support email"];
    };
    readonly STARTER: {
        readonly name: "Starter";
        readonly priceId: string;
        readonly monthlyPrice: 99;
        readonly limits: {
            readonly rooms: 20;
            readonly staff: 5;
            readonly apiCallsPerMonth: 10000;
            readonly storageGb: 5;
        };
        readonly features: readonly ["Dashboard basique", "Room Service illimité", "Coffre-fort (5 docs)", "Support email 48h"];
    };
    readonly PROFESSIONAL: {
        readonly name: "Professional";
        readonly priceId: string;
        readonly monthlyPrice: 299;
        readonly limits: {
            readonly rooms: 100;
            readonly staff: 25;
            readonly apiCallsPerMonth: 100000;
            readonly storageGb: 50;
        };
        readonly features: readonly ["Analytics avancés", "ML Predictions", "AI Chatbot", "Vault biométrique", "Support prioritaire 24h"];
        readonly popular: true;
    };
    readonly ENTERPRISE: {
        readonly name: "Enterprise";
        readonly priceId: string;
        readonly monthlyPrice: 999;
        readonly limits: {
            readonly rooms: -1;
            readonly staff: -1;
            readonly apiCallsPerMonth: -1;
            readonly storageGb: 500;
        };
        readonly features: readonly ["Multi-région", "SLA 99.99%", "Account manager dédié", "Custom integrations", "On-site training"];
    };
};
export type PlanKey = keyof typeof STRIPE_PLANS;
//# sourceMappingURL=stripe-plans.d.ts.map