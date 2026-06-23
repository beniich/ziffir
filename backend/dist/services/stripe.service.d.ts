import Stripe from 'stripe';
import { PlanKey } from '../config/stripe-plans';
export declare class StripeService {
    static ensureCustomer(hotelId: string): Promise<string>;
    static createCheckoutSession(hotelId: string, plan: PlanKey, successUrl: string, cancelUrl: string): Promise<import("stripe/cjs/lib").Response<import("stripe/cjs/resources/Checkout").Session>>;
    static createPortalSession(hotelId: string, returnUrl: string): Promise<import("stripe/cjs/lib").Response<import("stripe/cjs/resources/BillingPortal").Session>>;
    static handleWebhook(event: Stripe.Event): Promise<void>;
    private static onCheckoutCompleted;
    private static onSubscriptionChange;
    private static onSubscriptionDeleted;
    private static onInvoicePaid;
    private static onInvoiceFailed;
    private static onInvoiceFinalized;
    private static findLocalSub;
    static checkLimit(hotelId: string, metric: 'rooms' | 'staff' | 'apiCalls' | 'storage'): Promise<{
        allowed: boolean;
        current: number;
        limit: number;
        plan: string;
    }>;
    static trackUsage(hotelId: string, metric: 'api_calls' | 'rooms' | 'staff' | 'storage_gb', value?: number): Promise<void>;
    static hasFeature(hotelId: string, feature: string): Promise<boolean>;
    private static getCurrentPeriod;
    static getSubscription(hotelId: string): Promise<({
        invoices: {
            number: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            id: string;
            createdAt: Date;
            stripeInvoiceId: string;
            subscriptionId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            paidAt: Date | null;
            dueAt: Date | null;
            pdfUrl: string | null;
            lineItems: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        status: import(".prisma/client").$Enums.SubStatus;
        id: string;
        hotelId: string;
        createdAt: Date;
        updatedAt: Date;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAt: Date | null;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
    }) | null>;
    static getInvoices(hotelId: string, limit?: number): Promise<{
        number: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        id: string;
        createdAt: Date;
        stripeInvoiceId: string;
        subscriptionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        paidAt: Date | null;
        dueAt: Date | null;
        pdfUrl: string | null;
        lineItems: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    static getUsage(hotelId: string): Promise<{
        plan: import(".prisma/client").$Enums.Plan;
        status: import(".prisma/client").$Enums.SubStatus;
        limits: {
            readonly rooms: 5;
            readonly staff: 2;
            readonly apiCallsPerMonth: 1000;
            readonly storageGb: 1;
        } | {
            readonly rooms: 20;
            readonly staff: 5;
            readonly apiCallsPerMonth: 10000;
            readonly storageGb: 5;
        } | {
            readonly rooms: 100;
            readonly staff: 25;
            readonly apiCallsPerMonth: 100000;
            readonly storageGb: 50;
        } | {
            readonly rooms: -1;
            readonly staff: -1;
            readonly apiCallsPerMonth: -1;
            readonly storageGb: 500;
        };
        current: {
            rooms: number;
            staff: number;
            apiCalls: number;
            storageGb: number;
        };
    } | null>;
}
//# sourceMappingURL=stripe.service.d.ts.map