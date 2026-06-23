"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const stripe_service_1 = require("../services/stripe.service");
const logger_1 = require("../utils/logger");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const router = (0, express_1.Router)();
/**
 * POST /api/billing/webhook
 * ⚠️ DOIT être monté AVANT express.json() pour recevoir le raw body
 */
router.post('/webhook', (0, express_1.raw)({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        logger_1.logger.warn('Webhook sans signature Stripe');
        res.status(400).send('Missing signature');
        return;
    }
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        await stripe_service_1.StripeService.handleWebhook(event);
        res.json({ received: true });
    }
    catch (err) {
        logger_1.logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});
exports.default = router;
//# sourceMappingURL=stripe-webhook.routes.js.map