"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackApiUsage = exports.requirePlanLimit = void 0;
const stripe_service_1 = require("../services/stripe.service");
/**
 * Middleware : bloque l'opération si la limite du plan est atteinte.
 * Usage : router.post('/rooms', requirePlanLimit('rooms'), controller.create)
 */
const requirePlanLimit = (metric) => {
    return async (req, res, next) => {
        try {
            const ctx = req.user;
            if (!ctx.hotelId)
                return next();
            const result = await stripe_service_1.StripeService.checkLimit(ctx.hotelId, metric);
            if (!result.allowed) {
                res.status(402).json({
                    success: false,
                    error: `Limite de plan atteinte : ${result.current}/${result.limit === -1 ? '∞' : result.limit} ${metric}`,
                    upgrade: true,
                    currentPlan: result.plan,
                    upgradeUrl: '/admin/billing',
                });
                return;
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.requirePlanLimit = requirePlanLimit;
/**
 * Track automatiquement l'usage après une réponse réussie
 */
const trackApiUsage = () => {
    return (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode < 400) {
                const ctx = req.user;
                if (ctx?.hotelId) {
                    stripe_service_1.StripeService.trackUsage(ctx.hotelId, 'api_calls', 1).catch(() => { });
                }
            }
        });
        next();
    };
};
exports.trackApiUsage = trackApiUsage;
//# sourceMappingURL=plan-limits.js.map