import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Client Redis singleton (réutilisé partout).
 * Configuration optimisée pour production.
 */
export const redis = new Redis(REDIS_URL, {
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

redis.on('connect', () => {
  logger.info('🔴 Redis connecting...');
});

redis.on('ready', () => {
  logger.info('✅ Redis ready');
});

redis.on('error', (err) => {
  logger.error(`❌ Redis error: ${err.message}`);
});

redis.on('close', () => {
  logger.warn('⚠️  Redis connection closed');
});

redis.on('reconnecting', (ms: number) => {
  logger.info(`🔄 Redis reconnecting in ${ms}ms`);
});

redis.on('end', () => {
  logger.error('❌ Redis connection ended');
});

// ════════════════════════════════════════════════════════════
// HELPER : HEALTH CHECK
// ════════════════════════════════════════════════════════════

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
};

// ════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════

export const closeRedis = async (): Promise<void> => {
  await redis.quit();
  logger.info('Redis closed gracefully');
};
