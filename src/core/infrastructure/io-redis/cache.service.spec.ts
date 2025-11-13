/* eslint-disable @typescript-eslint/unbound-method */
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHash } from 'crypto';
import superjson from 'superjson';
import { CacheService } from './cache.service';
import { IoRedisService } from './io-redis.service';

describe('CacheService', () => {
  let cacheService: CacheService;
  let ioRedisService: jest.Mocked<IoRedisService>;

  beforeEach(async () => {
    const mockIoRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      scanAndDelete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: IoRedisService,
          useValue: mockIoRedisService,
        },
      ],
    }).compile();

    cacheService = moduleRef.get(CacheService);
    ioRedisService = moduleRef.get(IoRedisService);

    // Logger의 메서드들을 mock하여 콘솔 출력을 방지
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shoule be defined', () => {
    expect(cacheService).toBeDefined();
  });

  describe('withCaching', () => {
    const cacheKey = 'test-key';
    const testData = { id: BigInt(1), name: 'Test Data', date: new Date() };
    const stringfiedData = superjson.stringify(testData);
    const fetchFn = jest.fn().mockResolvedValue(testData);

    it('should return cached data on cache hit', async () => {
      ioRedisService.get.mockResolvedValue(stringfiedData);

      const result = await cacheService.withCaching({
        cacheKey,
        fetchFn,
      });

      expect(result).toEqual(testData);
      expect(ioRedisService.get).toHaveBeenCalledWith(cacheKey);
      expect(ioRedisService.set).not.toHaveBeenCalled();
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch data, set cache, and return data on cache miss', async () => {
      const ttlSeconds = 600;
      ioRedisService.get.mockResolvedValue(null);

      const result = await cacheService.withCaching({
        cacheKey,
        fetchFn,
        ttlSeconds,
      });

      expect(result).toEqual(testData);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(ioRedisService.set).toHaveBeenCalledWith(
        cacheKey,
        stringfiedData,
        ttlSeconds,
      );
    });

    it('should use default TTL (3600) if not provided on cache miss', async () => {
      ioRedisService.get.mockResolvedValue(null);

      await cacheService.withCaching({
        cacheKey,
        fetchFn,
      });

      expect(ioRedisService.set).toHaveBeenCalledWith(
        cacheKey,
        stringfiedData,
        3600,
      );
    });

    it('should re-throw error if ioRedisService.get fails', async () => {
      const error = new Error('Redis Get failed');
      ioRedisService.get.mockRejectedValue(error);

      await expect(
        cacheService.withCaching({
          cacheKey,
          fetchFn,
        }),
      ).rejects.toThrow(error);
    });

    it('should re-throw error if ioRedisService.set fails', async () => {
      ioRedisService.get.mockResolvedValue(null);
      const error = new Error('Redis Set failed');
      ioRedisService.set.mockRejectedValue(error);

      await expect(
        cacheService.withCaching({
          cacheKey,
          fetchFn,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('invalidate', () => {
    const cacheKey = 'key-to-delete';

    it('should call ioRedisService.del', async () => {
      ioRedisService.del.mockResolvedValue(1);

      const result = await cacheService.invalidate(cacheKey);

      expect(result).toBe(1);
      expect(ioRedisService.del).toHaveBeenCalledWith(cacheKey);
      expect(ioRedisService.del).toHaveBeenCalledTimes(1);
    });

    it('should re-throw error if ioRedisService.del fails', async () => {
      const error = new Error('Redis Del failed');
      ioRedisService.del.mockRejectedValue(error);

      await expect(cacheService.invalidate(cacheKey)).rejects.toThrow(error);
    });
  });

  describe('invalidateByPattern', () => {
    const pattern = 'user:*';

    it('should call ioRedisService.scanAndDelete', async () => {
      ioRedisService.scanAndDelete.mockResolvedValue(3);

      const result = await cacheService.invalidateByPattern(pattern);

      expect(result).toBe(3);
      expect(ioRedisService.scanAndDelete).toHaveBeenCalledWith(pattern);
      expect(ioRedisService.scanAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should re-throw error if ioRedisService.scanAndDelete fails', async () => {
      const error = new Error('Redis scanAndDelete failed');
      ioRedisService.scanAndDelete.mockRejectedValue(error);

      await expect(ioRedisService.scanAndDelete).rejects.toThrow(error);
    });
  });

  describe('generateCacheKey', () => {
    const prefix = 'test-prefix';
    const testObj = {
      id: BigInt(1),
      name: 'test-user',
      date: new Date(),
    };

    it('should generate a consistent SHA-256 hash key', () => {
      const stringfied = superjson.stringify(testObj);
      const expectedHash = createHash('sha-256')
        .update(stringfied)
        .digest('hex');
      const expectedHashKey = `${prefix}:${expectedHash}`;

      const result = cacheService.generateCacheKey(prefix, testObj);

      expect(result).toBe(expectedHashKey);
      expect(result.length).toBe(prefix.length + 1 + 64);
    });

    it('should generate the same key for identical inputs (idempotency)', () => {
      const result1 = cacheService.generateCacheKey(prefix, testObj);
      const result2 = cacheService.generateCacheKey(prefix, testObj);

      expect(result1).toBe(result2);
    });

    it('should generate different keys for different objects', () => {
      const obj1 = { id: BigInt(1), name: 'user1' };
      const obj2 = { id: BigInt(2), name: 'user2' };

      const key1 = cacheService.generateCacheKey(prefix, obj1);
      const key2 = cacheService.generateCacheKey(prefix, obj2);

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different prefixes with same object', () => {
      const prefix1 = 'prefix1';
      const prefix2 = 'prefix2';

      const key1 = cacheService.generateCacheKey(prefix1, testObj);
      const key2 = cacheService.generateCacheKey(prefix2, testObj);

      expect(key1).not.toBe(key2);
      expect(key1.startsWith(prefix1)).toBe(true);
      expect(key2.startsWith(prefix2)).toBe(true);
    });

    it('should generate different keys when object property order differs', () => {
      const obj1 = { name: 'test', id: 1 };
      const obj2 = { id: 1, name: 'test' };

      const key1 = cacheService.generateCacheKey(prefix, obj1);
      const key2 = cacheService.generateCacheKey(prefix, obj2);

      // superjson preserves property order, so keys should be different
      expect(key1).not.toBe(key2);
    });

    it('should handle empty object', () => {
      const emptyObj = {};

      const result = cacheService.generateCacheKey(prefix, emptyObj);

      expect(result).toBeDefined();
      expect(result.startsWith(`${prefix}:`)).toBe(true);
      expect(result.length).toBe(prefix.length + 1 + 64);
    });

    it('should handle nested objects', () => {
      const nestedObj = {
        user: {
          id: BigInt(1),
          profile: {
            name: 'test',
            settings: { theme: 'dark' },
          },
        },
        timestamp: new Date(),
      };

      const result = cacheService.generateCacheKey(prefix, nestedObj);

      expect(result).toBeDefined();
      expect(result.startsWith(`${prefix}:`)).toBe(true);
      expect(result.length).toBe(prefix.length + 1 + 64);
    });

    it('should handle arrays in objects', () => {
      const objWithArray = {
        ids: [BigInt(1), BigInt(2), BigInt(3)],
        tags: ['tag1', 'tag2'],
      };

      const result = cacheService.generateCacheKey(prefix, objWithArray);

      expect(result).toBeDefined();
      expect(result.startsWith(`${prefix}:`)).toBe(true);
      expect(result.length).toBe(prefix.length + 1 + 64);
    });
  });
});
