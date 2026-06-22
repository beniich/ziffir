import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { cacheOperations, cacheOperationDuration } from '../utils/metrics';

export interface CacheOptions {
  ttl?: number; // Time to live en secondes
  prefix?: string; // Préfixe pour organiser les clés
}

const DEFAULT_TTL = 300; // 5 minutes

export class CacheService {
  static async get<T = any>(key: string): Promise<T | null> {
    const end = cacheOperationDuration.startTimer({ operation: 'get' });
    try {
      const value = await redis.get(key);
      const result = value ? JSON.parse(value) as T : null;
      cacheOperations.inc({ operation: 'get', result: value ? 'hit' : 'miss' });
      end();
      return result;
    } catch (err) {
      cacheOperations.inc({ operation: 'get', result: 'error' });
      end();
      logger.error(`Cache GET error: ${(err as Error).message} key=${key}`);
      return null;
    }
  }

  static async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const end = cacheOperationDuration.startTimer({ operation: 'set' });
    try {
      const ttl = options.ttl ?? DEFAULT_TTL;
      await redis.setex(key, ttl, JSON.stringify(value));
      cacheOperations.inc({ operation: 'set', result: 'success' });
      end();
    } catch (err) {
      cacheOperations.inc({ operation: 'set', result: 'error' });
      end();
      logger.error(`Cache SET error: ${(err as Error).message} key=${key}`);
    }
  }

  static async del(key: string): Promise<void> {
    const end = cacheOperationDuration.startTimer({ operation: 'del' });
    try {
      await redis.del(key);
      cacheOperations.inc({ operation: 'del', result: 'success' });
      end();
    } catch (err) {
      cacheOperations.inc({ operation: 'del', result: 'error' });
      end();
      logger.error(`Cache DEL error: ${(err as Error).message} key=${key}`);
    }
  }

  static async delPattern(pattern: string): Promise<number> {
    let deleted = 0;
    try {
      const stream = redis.scanStream({ match: pattern, count: 100 });
      const pipeline = redis.pipeline();

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          keys.forEach((key) => pipeline.del(key));
        });
        stream.on('end', () => resolve());
        stream.on('error', reject);
      });

      const results = await pipeline.exec();
      deleted = results?.filter(([err]) => !err).length || 0;
    } catch (err) {
      logger.error(`Cache DEL PATTERN error: ${(err as Error).message} pattern=${pattern}`);
    }
    return deleted;
  }

  static async remember<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL,
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    // Fetch and cache
    const fresh = await fetcher();
    await this.set(key, fresh, { ttl });
    return fresh;
  }

  static async invalidate(...keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.del(k)));
  }
}
