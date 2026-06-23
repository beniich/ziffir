"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.checkRedisHealth = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
/**
 * Client Redis singleton (réutilisé partout).
 * Configuration optimisée pour production.
 */
exports.redis = new ioredis_1.default(REDIS_URL, {
    // Failover
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    // Performance
    enableReadyCheck: true,
    enableOfflineQueue: true,
    connectTimeout: 10_000,
    // Connection pool
    family: 4,
    keepAlive: 30_000,
    // Reconnection
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true; // Reconnect sur erreurs READONLY (failover)
        }
        return false;
    },
});
// ════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ════════════════════════════════════════════════════════════
exports.redis.on('connect', () => {
    logger_1.logger.info('🔴 Redis connecting...');
});
exports.redis.on('ready', () => {
    logger_1.logger.info('✅ Redis ready');
});
exports.redis.on('error', (err) => {
    logger_1.logger.error(`❌ Redis error: ${err.message}`);
});
exports.redis.on('close', () => {
    logger_1.logger.warn('⚠️  Redis connection closed');
});
exports.redis.on('reconnecting', (ms) => {
    logger_1.logger.info(`🔄 Redis reconnecting in ${ms}ms`);
});
exports.redis.on('end', () => {
    logger_1.logger.error('❌ Redis connection ended');
});
// ════════════════════════════════════════════════════════════
// HELPER : HEALTH CHECK
// ════════════════════════════════════════════════════════════
const checkRedisHealth = async () => {
    try {
        const pong = await exports.redis.ping();
        return pong === 'PONG';
    }
    catch {
        return false;
    }
};
exports.checkRedisHealth = checkRedisHealth;
// ════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════
const closeRedis = async () => {
    await exports.redis.quit();
    logger_1.logger.info('Redis closed gracefully');
};
exports.closeRedis = closeRedis;
//# sourceMappingURL=redis.js.map