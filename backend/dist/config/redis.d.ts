import Redis from 'ioredis';
/**
 * Client Redis singleton (réutilisé partout).
 * Configuration optimisée pour production.
 */
export declare const redis: Redis;
export declare const checkRedisHealth: () => Promise<boolean>;
export declare const closeRedis: () => Promise<void>;
//# sourceMappingURL=redis.d.ts.map