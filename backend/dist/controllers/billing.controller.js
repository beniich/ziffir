"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const stripe_service_1 = require("../services/stripe.service");
const stripe_plans_1 = require("../config/stripe-plans");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class BillingController {
    /**
     * GET /api/billing/plans
     * Liste publique des plans
     */
    static async listPlans(_req, res) {
        try {
            const plans = Object.entries(stripe_plans_1.STRIPE_PLANS).map(([key, config]) => ({
                id: key,
                name: config.name,
                monthlyPrice: config.monthlyPrice,
                limits: config.limits,
                features: config.features,
                popular: 'popular' in config ? config.popular : false,
            }));
            res.json({ success: true, data: plans });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    /**
     * GET /api/billing/subscription
     * Subscription actuelle de l'hôtel
     */
    static async getSubscription(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const sub = await stripe_service_1.StripeService.getSubscription(hotelId);
            res.json({ success: true, data: sub });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * GET /api/billing/usage
     * Usage actuel vs limites
     */
    static async getUsage(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const usage = await stripe_service_1.StripeService.getUsage(hotelId);
            res.json({ success: true, data: usage });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/billing/checkout
     * Crée une session de checkout
     */
    static async createCheckout(req, res) {
        try {
            const ctx = req.user;
            const { plan } = req.body;
            const hotelId = ctx.hotelId;
            if (!stripe_plans_1.STRIPE_PLANS[plan]) {
                throw new errorHandler_1.AppError(400, 'Plan invalide');
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const session = await stripe_service_1.StripeService.createCheckoutSession(hotelId, plan, `${frontendUrl}/admin/billing?success=true`, `${frontendUrl}/admin/billing?canceled=true`);
            res.json({
                success: true,
                data: {
                    url: session.url,
                    sessionId: session.id,
                },
            });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/billing/portal
     * Crée une session du portail client Stripe
     */
    static async createPortal(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const session = await stripe_service_1.StripeService.createPortalSession(hotelId, `${frontendUrl}/admin/billing`);
            res.json({
                success: true,
                data: { url: session.url },
            });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * GET /api/billing/invoices
     * Historique des factures
     */
    static async listInvoices(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const invoices = await stripe_service_1.StripeService.getInvoices(hotelId);
            res.json({ success: true, data: invoices });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/billing/cancel
     * Annulation à la fin de la période
     */
    static async cancel(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            const sub = await prisma.subscription.findUnique({ where: { hotelId } });
            if (!sub?.stripeSubscriptionId) {
                throw new errorHandler_1.AppError(404, 'Aucun abonnement actif');
            }
            const Stripe = (await Promise.resolve().then(() => __importStar(require('stripe')))).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
            logger_1.logger.info(`Subscription canceled at period end: hotelId=${hotelId} subId=${sub.stripeSubscriptionId}`);
            res.json({ success: true, message: 'Annulation programmée à la fin de la période' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/billing/resume
     * Réactive un abonnement annulé
     */
    static async resume(req, res) {
        try {
            const ctx = req.user;
            const hotelId = ctx.hotelId;
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            const sub = await prisma.subscription.findUnique({ where: { hotelId } });
            if (!sub?.stripeSubscriptionId) {
                throw new errorHandler_1.AppError(404, 'Aucun abonnement');
            }
            const Stripe = (await Promise.resolve().then(() => __importStar(require('stripe')))).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });
            res.json({ success: true, message: 'Abonnement réactivé' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.BillingController = BillingController;
//# sourceMappingURL=billing.controller.js.map