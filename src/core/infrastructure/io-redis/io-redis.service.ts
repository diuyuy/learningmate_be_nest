/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import { MODULE_OPTIONS_TOKEN } from './io-redis.module-definition';

@Injectable()
export class IoRedisService implements OnModuleDestroy {
  private readonly logger = new Logger(IoRedisService.name);
  private readonly redisClient: Redis;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: RedisOptions) {
    this.redisClient = new Redis(options);

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error', error.stack);
    });

    this.redisClient.on('close', () => {
      this.logger.warn('Redis client connection closed');
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.log('Redis client reconnecting');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redisClient.get(key);
      this.logger.debug(`GET ${key}: ${value !== null ? 'hit' : 'miss'}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to GET ${key}`, error.stack);
      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        this.logger.debug(`SET ${key} with TTL ${ttlSeconds}s`);
      } else {
        await this.redisClient.set(key, value);
        this.logger.debug(`SET ${key}`);
      }
    } catch (error) {
      this.logger.error(`Failed to SET ${key}`, error.stack);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result = await this.redisClient.del(key);
      this.logger.debug(`DEL ${key}: ${result} key(s) deleted`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to DEL ${key}`, error.stack);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      this.logger.debug(`EXISTS ${key}: ${result === 1}`);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check EXISTS ${key}`, error.stack);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      this.logger.debug(`EXPIRE ${key} ${seconds}s: ${result === 1}`);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to EXPIRE ${key}`, error.stack);
      throw error;
    }
  }

  async expireInDays(key: string, days: number): Promise<boolean> {
    try {
      const seconds = days * 24 * 60 * 60;
      const result = await this.redisClient.expire(key, seconds);
      this.logger.debug(`EXPIRE ${key} ${days} day(s): ${result === 1}`);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to EXPIRE ${key}`, error.stack);
      throw error;
    }
  }

  async getTtlSeconds(key: string): Promise<number> {
    try {
      const result = await this.redisClient.ttl(key);
      this.logger.debug(`TTL ${key}: ${result}s`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get TTL ${key}`, error.stack);
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      const result = await this.redisClient.incr(key);
      this.logger.debug(`INCR ${key}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to INCR ${key}`, error.stack);
      throw error;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      const result = await this.redisClient.incrby(key, increment);
      this.logger.debug(`INCRBY ${key} ${increment}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to INCRBY ${key}`, error.stack);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      const result = await this.redisClient.decr(key);
      this.logger.debug(`DECR ${key}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to DECR ${key}`, error.stack);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      const value = await this.redisClient.hget(key, field);
      this.logger.debug(
        `HGET ${key} ${field}: ${value !== null ? 'hit' : 'miss'}`,
      );
      return value;
    } catch (error) {
      this.logger.error(`Failed to HGET ${key} ${field}`, error.stack);
      throw error;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      const result = await this.redisClient.hset(key, field, value);
      this.logger.debug(`HSET ${key} ${field}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to HSET ${key} ${field}`, error.stack);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      const result = await this.redisClient.hgetall(key);
      this.logger.debug(`HGETALL ${key}: ${Object.keys(result).length} fields`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to HGETALL ${key}`, error.stack);
      throw error;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      const result = await this.redisClient.hdel(key, ...fields);
      this.logger.debug(`HDEL ${key} ${fields.join(', ')}: ${result} deleted`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to HDEL ${key}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    await this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }
}
