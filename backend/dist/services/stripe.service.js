"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("../config/database");
const stripe_plans_1 = require("../config/stripe-plans");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY manquant');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
class StripeService {
    // ════════════════════════════════════════════════════════════
    // CUSTOMER MANAGEMENT
    // ════════════════════════════════════════════════════════════
    static async ensureCustomer(hotelId) {
        const sub = await database_1.prisma.subscription.findUnique({ where: { hotelId } });
        if (sub?.stripeCustomerId)
            return sub.stripeCustomerId;
        const hotel = await database_1.prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel)
            throw new errorHandler_1.AppError(404, 'Hôtel introuvable');
        const customer = await stripe.customers.create({
            email: `billing+${hotel.slug}@zaphir.com`,
            name: hotel.name,
            metadata: { hotelId, slug: hotel.slug },
        });
        await database_1.prisma.subscription.upsert({
            where: { hotelId },
            update: { stripeCustomerId: customer.id },
            create: {
                hotelId,
                stripeCustomerId: customer.id,
                plan: 'TRIAL',
                status: 'TRIALING',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 14 * 86400_000),
                trialEndsAt: new Date(Date.now() + 14 * 86400_000),
            },
        });
        return customer.id;
    }
    // ════════════════════════════════════════════════════════════
    // CHECKOUT SESSION
    // ════════════════════════════════════════════════════════════
    static async createCheckoutSession(hotelId, plan, successUrl, cancelUrl) {
        const planConfig = stripe_plans_1.STRIPE_PLANS[plan];
        if (!planConfig.priceId) {
            throw new errorHandler_1.AppError(400, 'Plan invalide (pas de prix Stripe)');
        }
        const customerId = await this.ensureCustomer(hotelId);
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: planConfig.priceId, quantity: 1 }],
            success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            metadata: { hotelId, plan },
            subscription_data: {
                metadata: { hotelId, plan },
                trial_period_days: plan === 'PROFESSIONAL' ? 14 : undefined,
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            tax_id_collection: { enabled: true },
        });
        return session;
    }
    // ════════════════════════════════════════════════════════════
    // CUSTOMER PORTAL
    // ════════════════════════════════════════════════════════════
    static async createPortalSession(hotelId, returnUrl) {
        const sub = await database_1.prisma.subscription.findUnique({ where: { hotelId } });
        if (!sub?.stripeCustomerId) {
            throw new errorHandler_1.AppError(404, 'Aucun abonnement actif. Souscrivez d\'abord à un plan.');
        }
        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: returnUrl,
        });
        return session;
    }
    // ════════════════════════════════════════════════════════════
    // WEBHOOK HANDLERS
    // ════════════════════════════════════════════════════════════
    static async handleWebhook(event) {
        logger_1.logger.info(`Stripe webhook: type=${event.type} id=${event.id}`);
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.onCheckoutCompleted(event.data.object);
                    break;
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    await this.onSubscriptionChange(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.onSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.paid':
                    await this.onInvoicePaid(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.onInvoiceFailed(event.data.object);
                    break;
                case 'invoice.finalized':
                    await this.onInvoiceFinalized(event.data.object);
                    break;
                default:
                    logger_1.logger.debug(`Unhandled webhook event: ${event.type}`);
            }
        }
        catch (err) {
            logger_1.logger.error(`Webhook handler failed for ${event.type}: ${err.message}`);
            throw err;
        }
    }
    static async onCheckoutCompleted(session) {
        const hotelId = session.metadata?.hotelId;
        if (!hotelId) {
            logger_1.logger.warn(`Checkout sans hotelId metadata: sessionId=${session.id}`);
            return;
        }
        if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            await this.onSubscriptionChange(sub);
        }
        logger_1.logger.info(`Checkout completed: hotelId=${hotelId} sessionId=${session.id}`);
    }
    static async onSubscriptionChange(sub) {
        const hotelId = sub.metadata?.hotelId;
        if (!hotelId) {
            logger_1.logger.warn(`Subscription sans hotelId metadata: subId=${sub.id}`);
            return;
        }
        const planKey = (sub.metadata?.plan || 'STARTER');
        const statusMap = {
            active: 'ACTIVE',
            trialing: 'TRIALING',
            past_due: 'PAST_DUE',
            canceled: 'CANCELED',
            incomplete: 'INCOMPLETE',
            incomplete_expired: 'CANCELED',
            unpaid: 'PAST_DUE',
            paused: 'PAST_DUE',
        };
        // Stripe v2025: current_period uses billing_cycle_anchor + items billing
        const periodStart = new Date(sub.current_period_start
            ? sub.current_period_start * 1000
            : Date.now());
        const periodEnd = new Date(sub.current_period_end
            ? sub.current_period_end * 1000
            : Date.now() + 30 * 86400_000);
        await database_1.prisma.subscription.upsert({
            where: { hotelId },
            update: {
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price.id,
                plan: planKey,
                status: (statusMap[sub.status] || 'INCOMPLETE'),
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
                canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
                trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            },
            create: {
                hotelId,
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price.id,
                stripeCustomerId: sub.customer,
                plan: planKey,
                status: (statusMap[sub.status] || 'INCOMPLETE'),
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            },
        });
        logger_1.logger.info(`Subscription synced: hotelId=${hotelId} plan=${planKey} status=${sub.status}`);
    }
    static async onSubscriptionDeleted(sub) {
        await database_1.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            },
        });
    }
    static async onInvoicePaid(invoice) {
        const stripeSubId = invoice.subscription;
        if (!stripeSubId)
            return;
        const localSub = await this.findLocalSub(stripeSubId);
        if (!localSub)
            return;
        await database_1.prisma.invoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            update: {
                status: 'PAID',
                paidAt: new Date(),
                pdfUrl: invoice.invoice_pdf ?? undefined,
            },
            create: {
                stripeInvoiceId: invoice.id,
                subscriptionId: localSub.id,
                number: invoice.number || `INV-${Date.now()}`,
                amount: (invoice.amount_paid || 0) / 100,
                currency: invoice.currency,
                status: 'PAID',
                paidAt: new Date(),
                pdfUrl: invoice.invoice_pdf ?? undefined,
                lineItems: (invoice.lines?.data || []),
                dueAt: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
            },
        });
    }
    static async onInvoiceFailed(invoice) {
        await database_1.prisma.invoice.updateMany({
            where: { stripeInvoiceId: invoice.id },
            data: { status: 'OPEN' },
        });
    }
    static async onInvoiceFinalized(invoice) {
        const stripeSubId = invoice.subscription;
        if (!stripeSubId)
            return;
        const localSub = await this.findLocalSub(stripeSubId);
        if (!localSub)
            return;
        await database_1.prisma.invoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            update: {
                number: invoice.number || `INV-${Date.now()}`,
                pdfUrl: invoice.invoice_pdf ?? undefined,
                status: 'OPEN',
            },
            create: {
                stripeInvoiceId: invoice.id,
                subscriptionId: localSub.id,
                number: invoice.number || `INV-${Date.now()}`,
                amount: (invoice.amount_due || 0) / 100,
                currency: invoice.currency,
                status: 'OPEN',
                lineItems: (invoice.lines?.data || []),
                dueAt: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
                pdfUrl: invoice.invoice_pdf ?? undefined,
            },
        });
    }
    static async findLocalSub(stripeSubId) {
        return database_1.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
            select: { id: true, hotelId: true },
        });
    }
    // ════════════════════════════════════════════════════════════
    // LIMIT ENFORCEMENT
    // ════════════════════════════════════════════════════════════
    static async checkLimit(hotelId, metric) {
        const sub = await database_1.prisma.subscription.findUnique({
            where: { hotelId },
            include: {
                usage: { where: { period: this.getCurrentPeriod() } },
            },
        });
        if (!sub) {
            return { allowed: false, current: 0, limit: 0, plan: 'NONE' };
        }
        const plan = stripe_plans_1.STRIPE_PLANS[sub.plan];
        const limitKey = metric === 'apiCalls' ? 'apiCallsPerMonth' : metric;
        const limit = plan.limits[limitKey];
        if (limit === -1) {
            return { allowed: true, current: 0, limit: -1, plan: sub.plan };
        }
        let current = 0;
        switch (metric) {
            case 'rooms':
                current = await database_1.prisma.room.count({ where: { hotelId } });
                break;
            case 'staff':
                current = await database_1.prisma.staffMember.count({ where: { hotelId, active: true } });
                break;
            case 'apiCalls': {
                const apiUsage = sub.usage.find((u) => u.metric === 'api_calls');
                current = apiUsage?.value || 0;
                break;
            }
            case 'storage': {
                const storageUsage = sub.usage.find((u) => u.metric === 'storage_gb');
                current = storageUsage?.value || 0;
                break;
            }
        }
        return { allowed: current < limit, current, limit, plan: sub.plan };
    }
    static async trackUsage(hotelId, metric, value = 1) {
        const sub = await database_1.prisma.subscription.findUnique({ where: { hotelId } });
        if (!sub)
            return;
        await database_1.prisma.usageRecord.create({
            data: {
                subscriptionId: sub.id,
                metric,
                value,
                period: this.getCurrentPeriod(),
            },
        });
    }
    static async hasFeature(hotelId, feature) {
        const sub = await database_1.prisma.subscription.findUnique({ where: { hotelId } });
        if (!sub)
            return false;
        const plan = stripe_plans_1.STRIPE_PLANS[sub.plan];
        return plan.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()));
    }
    static getCurrentPeriod() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    // ════════════════════════════════════════════════════════════
    // QUERIES
    // ════════════════════════════════════════════════════════════
    static async getSubscription(hotelId) {
        return database_1.prisma.subscription.findUnique({
            where: { hotelId },
            include: {
                invoices: { orderBy: { createdAt: 'desc' }, take: 12 },
            },
        });
    }
    static async getInvoices(hotelId, limit = 20) {
        const sub = await database_1.prisma.subscription.findUnique({ where: { hotelId } });
        if (!sub)
            return [];
        return database_1.prisma.invoice.findMany({
            where: { subscriptionId: sub.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    static async getUsage(hotelId) {
        const sub = await database_1.prisma.subscription.findUnique({
            where: { hotelId },
            include: { usage: { where: { period: this.getCurrentPeriod() } } },
        });
        if (!sub)
            return null;
        const plan = stripe_plans_1.STRIPE_PLANS[sub.plan];
        return {
            plan: sub.plan,
            status: sub.status,
            limits: plan.limits,
            current: {
                rooms: await database_1.prisma.room.count({ where: { hotelId } }),
                staff: await database_1.prisma.staffMember.count({ where: { hotelId, active: true } }),
                apiCalls: sub.usage.find((u) => u.metric === 'api_calls')?.value || 0,
                storageGb: sub.usage.find((u) => u.metric === 'storage_gb')?.value || 0,
            },
        };
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map