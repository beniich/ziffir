"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
const metrics_1 = require("../utils/metrics");
const DEFAULT_TTL = 300; // 5 minutes
class CacheService {
    static async get(key) {
        const end = metrics_1.cacheOperationDuration.startTimer({ operation: 'get' });
        try {
            const value = await redis_1.redis.get(key);
            const result = value ? JSON.parse(value) : null;
            metrics_1.cacheOperations.inc({ operation: 'get', result: value ? 'hit' : 'miss' });
            end();
            return result;
        }
        catch (err) {
            metrics_1.cacheOperations.inc({ operation: 'get', result: 'error' });
            end();
            logger_1.logger.error(`Cache GET error: ${err.message} key=${key}`);
            return null;
        }
    }
    static async set(key, value, options = {}) {
        const end = metrics_1.cacheOperationDuration.startTimer({ operation: 'set' });
        try {
            const ttl = options.ttl ?? DEFAULT_TTL;
            await redis_1.redis.setex(key, ttl, JSON.stringify(value));
            metrics_1.cacheOperations.inc({ operation: 'set', result: 'success' });
            end();
        }
        catch (err) {
            metrics_1.cacheOperations.inc({ operation: 'set', result: 'error' });
            end();
            logger_1.logger.error(`Cache SET error: ${err.message} key=${key}`);
        }
    }
    static async del(key) {
        const end = metrics_1.cacheOperationDuration.startTimer({ operation: 'del' });
        try {
            await redis_1.redis.del(key);
            metrics_1.cacheOperations.inc({ operation: 'del', result: 'success' });
            end();
        }
        catch (err) {
            metrics_1.cacheOperations.inc({ operation: 'del', result: 'error' });
            end();
            logger_1.logger.error(`Cache DEL error: ${err.message} key=${key}`);
        }
    }
    static async delPattern(pattern) {
        let deleted = 0;
        try {
            const stream = redis_1.redis.scanStream({ match: pattern, count: 100 });
            const pipeline = redis_1.redis.pipeline();
            await new Promise((resolve, reject) => {
                stream.on('data', (keys) => {
                    keys.forEach((key) => pipeline.del(key));
                });
                stream.on('end', () => resolve());
                stream.on('error', reject);
            });
            const results = await pipeline.exec();
            deleted = results?.filter(([err]) => !err).length || 0;
        }
        catch (err) {
            logger_1.logger.error(`Cache DEL PATTERN error: ${err.message} pattern=${pattern}`);
        }
        return deleted;
    }
    static async remember(key, fetcher, ttl = DEFAULT_TTL) {
        // Try cache first
        const cached = await this.get(key);
        if (cached !== null)
            return cached;
        // Fetch and cache
        const fresh = await fetcher();
        await this.set(key, fresh, { ttl });
        return fresh;
    }
    static async invalidate(...keys) {
        await Promise.all(keys.map((k) => this.del(k)));
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map