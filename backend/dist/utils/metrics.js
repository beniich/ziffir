"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditChainValid = exports.blockedIps = exports.securityEvents = exports.authLockouts = exports.auditLogsCreated = exports.ordersAdvanced = exports.rateLimitHits = exports.authAttempts = exports.redisConnections = exports.cacheOperationDuration = exports.cacheOperations = exports.activeConnections = exports.httpRequestsTotal = exports.httpRequestDurationSeconds = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
// ════════════════════════════════════════════════════════════
// HTTP
// ════════════════════════════════════════════════════════════
exports.httpRequestDurationSeconds = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [exports.register],
});
exports.httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes HTTP',
    labelNames: ['method', 'route', 'status'],
    registers: [exports.register],
});
exports.activeConnections = new prom_client_1.default.Gauge({
    name: 'active_connections',
    help: 'Nombre de connexions WebSocket actives',
    registers: [exports.register],
});
// ════════════════════════════════════════════════════════════
// CACHE (Redis)
// ════════════════════════════════════════════════════════════
exports.cacheOperations = new prom_client_1.default.Counter({
    name: 'zaphir_cache_operations_total',
    help: 'Opérations de cache Redis',
    labelNames: ['operation', 'result'], // operation: get/set/del, result: hit/miss/error
    registers: [exports.register],
});
exports.cacheOperationDuration = new prom_client_1.default.Histogram({
    name: 'zaphir_cache_operation_duration_seconds',
    help: 'Durée des opérations Redis',
    labelNames: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5],
    registers: [exports.register],
});
exports.redisConnections = new prom_client_1.default.Gauge({
    name: 'zaphir_redis_connections_active',
    help: 'Connexions Redis actives',
    registers: [exports.register],
});
// ════════════════════════════════════════════════════════════
// AUTH & RATE LIMITING
// ════════════════════════════════════════════════════════════
exports.authAttempts = new prom_client_1.default.Counter({
    name: 'zaphir_auth_attempts_total',
    help: 'Tentatives d\'authentification',
    labelNames: ['result'],
    registers: [exports.register],
});
exports.rateLimitHits = new prom_client_1.default.Counter({
    name: 'zaphir_rate_limit_hits_total',
    help: 'Requêtes bloquées par rate limit',
    labelNames: ['limiter'], // auth, write, read, heavy, global
    registers: [exports.register],
});
// ════════════════════════════════════════════════════════════
// BUSINESS
// ════════════════════════════════════════════════════════════
exports.ordersAdvanced = new prom_client_1.default.Counter({
    name: 'zaphir_orders_advanced_total',
    help: 'Avancements de statut de commandes',
    registers: [exports.register],
});
exports.auditLogsCreated = new prom_client_1.default.Counter({
    name: 'zaphir_audit_logs_created_total',
    help: 'Logs d\'audit créés',
    labelNames: ['status'],
    registers: [exports.register],
});
exports.authLockouts = new prom_client_1.default.Counter({
    name: 'zaphir_auth_lockouts_total',
    help: 'Nombre de verrouillages de compte (anti-brute-force)',
    registers: [exports.register],
});
exports.securityEvents = new prom_client_1.default.Counter({
    name: 'security_events_total',
    help: 'Événements de sécurité',
    labelNames: ['type', 'severity'],
    registers: [exports.register],
});
exports.blockedIps = new prom_client_1.default.Gauge({
    name: 'zaphir_blocked_ips',
    help: 'Nombre d\'IPs bloquées',
    registers: [exports.register],
});
exports.auditChainValid = new prom_client_1.default.Gauge({
    name: 'zaphir_audit_chain_valid',
    help: 'Intégrité de la chaîne d\'audit (1=valid, 0=compromised)',
    registers: [exports.register],
});
//# sourceMappingURL=metrics.js.map