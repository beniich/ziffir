"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tenantIsolation_1 = require("../middleware/tenantIsolation");
const metrics_1 = require("../utils/metrics");
const redis_1 = require("../config/redis");
// All imported routes
const auth_routes_1 = __importDefault(require("./auth.routes"));
const room_order_routes_1 = __importDefault(require("./room-order.routes"));
const staff_routes_1 = __importDefault(require("./staff.routes"));
const vault_routes_1 = __importDefault(require("./vault.routes"));
const controls_routes_1 = __importDefault(require("./controls.routes"));
const pricing_routes_1 = __importDefault(require("./pricing.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const audit_routes_1 = __importDefault(require("./audit.routes"));
const hotel_routes_1 = __importDefault(require("./hotel.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const invoice_routes_1 = __importDefault(require("./invoice.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const ml_routes_1 = __importDefault(require("./ml.routes"));
const router = (0, express_1.Router)();
// ════════════════════════════════════════════════════════════
// 1. ROUTES 100% PUBLIQUES (whitelist explicite)
// ════════════════════════════════════════════════════════════
router.use('/auth', auth_routes_1.default);
router.get('/health', async (_req, res) => {
    const redisHealthy = await (0, redis_1.checkRedisHealth)();
    res.json({
        success: true,
        data: {
            status: redisHealthy ? 'operational' : 'degraded',
            uptime: process.uptime(),
            redis: redisHealthy ? 'up' : 'down',
            timestamp: new Date().toISOString(),
        },
    });
});
router.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics_1.register.contentType);
    res.end(await metrics_1.register.metrics());
});
// ════════════════════════════════════════════════════════════
// 2. MIDDLEWARES GLOBAUX (à partir d'ici : tout est protégé)
// ════════════════════════════════════════════════════════════
router.use(auth_1.requireAuth); // 1. Vérifie JWT → req.user
router.use(tenantIsolation_1.tenantIsolation); // 2. Injecte hotelId/userId
// ════════════════════════════════════════════════════════════
// 3. ROUTES MÉTIER (toutes protégées par défaut)
// ════════════════════════════════════════════════════════════
router.use('/room-orders', room_order_routes_1.default);
router.use('/staff', staff_routes_1.default);
router.use('/vault', vault_routes_1.default);
router.use('/controls', controls_routes_1.default);
router.use('/pricing', pricing_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/audits', audit_routes_1.default);
router.use('/invoices', invoice_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/ai', ai_routes_1.default);
router.use('/ml', ml_routes_1.default);
// ─── Réservé SUPER_ADMIN ────────────────────────────────
router.use('/hotels', hotel_routes_1.default);
router.use('/users', user_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map