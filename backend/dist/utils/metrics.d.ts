import promClient from 'prom-client';
export declare const register: promClient.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const httpRequestDurationSeconds: promClient.Histogram<"method" | "route" | "status">;
export declare const httpRequestsTotal: promClient.Counter<"method" | "route" | "status">;
export declare const activeConnections: promClient.Gauge<string>;
export declare const cacheOperations: promClient.Counter<"operation" | "result">;
export declare const cacheOperationDuration: promClient.Histogram<"operation">;
export declare const redisConnections: promClient.Gauge<string>;
export declare const authAttempts: promClient.Counter<"result">;
export declare const rateLimitHits: promClient.Counter<"limiter">;
export declare const ordersAdvanced: promClient.Counter<string>;
export declare const auditLogsCreated: promClient.Counter<"status">;
export declare const authLockouts: promClient.Counter<string>;
export declare const securityEvents: promClient.Counter<"type" | "severity">;
export declare const blockedIps: promClient.Gauge<string>;
export declare const auditChainValid: promClient.Gauge<string>;
//# sourceMappingURL=metrics.d.ts.map