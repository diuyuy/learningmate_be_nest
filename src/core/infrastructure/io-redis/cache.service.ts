import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import superjson from 'superjson';
import { IoRedisService } from './io-redis.service';

type CacheOptions<T> = {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  ttlSeconds?: number;
};

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly ioRedisService: IoRedisService) {}

  async withCaching<T>(options: CacheOptions<T>): Promise<T> {
    const { cacheKey, fetchFn, ttlSeconds = 3600 } = options;

    try {
      const cached = await this.ioRedisService.get(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return superjson.parse(cached);
      }

      this.logger.debug(`Cache miss: ${cacheKey}`);
      const data = await fetchFn();

      await this.ioRedisService.set(
        cacheKey,
        superjson.stringify(data),
        ttlSeconds,
      );
      this.logger.debug(`Cache set: ${cacheKey} with TTL ${ttlSeconds}s`);

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to process cache: ${cacheKey}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async invalidate(cacheKey: string) {
    try {
      const result = await this.ioRedisService.del(cacheKey);
      this.logger.debug(`Cache invalidated: ${cacheKey}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache: ${cacheKey}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  generateCacheKey(prefix: string, obj: Record<string, unknown>) {
    const hash = createHash('sha256')
      .update(superjson.stringify(obj))
      .digest('hex');
    const cacheKey = `${prefix}:${hash}`;
    return cacheKey;
  }
}
