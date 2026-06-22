import promClient from 'prom-client';

export const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// ════════════════════════════════════════════════════════════
// HTTP
// ════════════════════════════════════════════════════════════

export const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Nombre de connexions WebSocket actives',
  registers: [register],
});

// ════════════════════════════════════════════════════════════
// CACHE (Redis)
// ════════════════════════════════════════════════════════════

export const cacheOperations = new promClient.Counter({
  name: 'zaphir_cache_operations_total',
  help: 'Opérations de cache Redis',
  labelNames: ['operation', 'result'], // operation: get/set/del, result: hit/miss/error
  registers: [register],
});

export const cacheOperationDuration = new promClient.Histogram({
  name: 'zaphir_cache_operation_duration_seconds',
  help: 'Durée des opérations Redis',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5],
  registers: [register],
});

export const redisConnections = new promClient.Gauge({
  name: 'zaphir_redis_connections_active',
  help: 'Connexions Redis actives',
  registers: [register],
});

// ════════════════════════════════════════════════════════════
// AUTH & RATE LIMITING
// ════════════════════════════════════════════════════════════

export const authAttempts = new promClient.Counter({
  name: 'zaphir_auth_attempts_total',
  help: 'Tentatives d\'authentification',
  labelNames: ['result'],
  registers: [register],
});

export const rateLimitHits = new promClient.Counter({
  name: 'zaphir_rate_limit_hits_total',
  help: 'Requêtes bloquées par rate limit',
  labelNames: ['limiter'], // auth, write, read, heavy, global
  registers: [register],
});

// ════════════════════════════════════════════════════════════
// BUSINESS
// ════════════════════════════════════════════════════════════

export const ordersAdvanced = new promClient.Counter({
  name: 'zaphir_orders_advanced_total',
  help: 'Avancements de statut de commandes',
  registers: [register],
});

export const auditLogsCreated = new promClient.Counter({
  name: 'zaphir_audit_logs_created_total',
  help: 'Logs d\'audit créés',
  labelNames: ['status'],
  registers: [register],
});

export const authLockouts = new promClient.Counter({
  name: 'zaphir_auth_lockouts_total',
  help: 'Nombre de verrouillages de compte (anti-brute-force)',
  registers: [register],
});

export const securityEvents = new promClient.Counter({
  name: 'security_events_total',
  help: 'Événements de sécurité',
  labelNames: ['type', 'severity'],
  registers: [register],
});

export const blockedIps = new promClient.Gauge({
  name: 'zaphir_blocked_ips',
  help: 'Nombre d\'IPs bloquées',
  registers: [register],
});

export const auditChainValid = new promClient.Gauge({
  name: 'zaphir_audit_chain_valid',
  help: 'Intégrité de la chaîne d\'audit (1=valid, 0=compromised)',
  registers: [register],
});
