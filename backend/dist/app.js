"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
// Import configurations de sécurité
const security_1 = require("./config/security");
const cors_1 = require("./config/cors");
const rateLimit_1 = require("./config/rateLimit");
const sanitization_1 = require("./middleware/sanitization");
const csrf_1 = require("./middleware/csrf");
const auditTrail_1 = require("./middleware/auditTrail");
const securityHeaders_1 = require("./middleware/securityHeaders");
const routes_1 = __importDefault(require("./routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const stripe_webhook_routes_1 = __importDefault(require("./routes/stripe-webhook.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const swagger_1 = require("./utils/swagger");
const metrics_1 = require("./middleware/metrics");
dotenv_1.default.config();
const createApp = () => {
    const app = (0, express_1.default)();
    // Métriques Prometheus (en premier pour mesurer fidèlement)
    app.use(metrics_1.metricsMiddleware);
    // Logging des requêtes HTTP
    app.use((req, res, next) => {
        logger_1.logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
        next();
    });
    // Swagger Documentation
    (0, swagger_1.setupSwagger)(app);
    // ════════════════════════════════════════════════════════════
    // SÉCURITÉ - LES 8 COUCHES
    // ════════════════════════════════════════════════════════════
    // Couche 1 & 8 : Headers de sécurité (Helmet + Custom)
    app.use((0, helmet_1.default)(security_1.helmetConfig));
    app.use(securityHeaders_1.customSecurityHeaders);
    // Couche 6 : CORS & CSRF
    app.use(cors_1.corsConfig);
    app.use(csrf_1.csrfProtection);
    // Couche 2 : Rate Limiting Global
    app.use(rateLimit_1.globalLimiter);
    // ════════════════════════════════════════════════════════════
    // PARSING & SANITIZATION
    // ════════════════════════════════════════════════════════════
    // ⚠️ CRITIQUE : Le webhook DOIT être monté AVANT express.json()
    app.use('/api/billing', stripe_webhook_routes_1.default);
    app.use(express_1.default.json({ limit: '10kb' })); // Limite stricte pour JSON (Couche 3)
    app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
    // Couche 3 : Nettoyage XSS/NoSQLi des inputs
    app.use(sanitization_1.sanitizeInputs);
    // Couche 7 : Audit Trail pour mutations
    app.use(auditTrail_1.auditTrail);
    // ════════════════════════════════════════════════════════════
    // ROUTES
    // ════════════════════════════════════════════════════════════
    app.use('/api', routes_1.default);
    // Billing routes (APRÈS auth globale - montées dans routes/index.ts ou ici, on suit la consigne d'ici)
    app.use('/api/billing', billing_routes_1.default);
    // ════════════════════════════════════════════════════════════
    // ERROR HANDLERS (DOIVENT ÊTRE EN DERNIER)
    // ════════════════════════════════════════════════════════════
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map