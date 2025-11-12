import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { BigIntInterceptor } from './bigint.interceptor';

describe('BigIntInterceptor', () => {
  let interceptor: BigIntInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new BigIntInterceptor();
    mockExecutionContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  describe('intercept', () => {
    it('should convert bigint to number', (done) => {
      const testData = { id: BigInt(12345) };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ id: 12345 });
          expect(typeof (result as { id: number }).id).toBe('number');
          done();
        },
      });
    });

    it('should handle null and undefined', (done) => {
      const testData = { nullValue: null, undefinedValue: undefined };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({
            nullValue: null,
            undefinedValue: undefined,
          });
          done();
        },
      });
    });

    it('should preserve Date objects', (done) => {
      const date = new Date('2024-01-01');
      const testData = { createdAt: date };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ createdAt: date });
          expect((result as { createdAt: Date }).createdAt).toBeInstanceOf(
            Date,
          );
          done();
        },
      });
    });

    it('should convert bigints in arrays', (done) => {
      const testData = [BigInt(1), BigInt(2), BigInt(3)];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual([1, 2, 3]);
          expect(Array.isArray(result)).toBe(true);
          done();
        },
      });
    });

    it('should convert bigints in nested objects', (done) => {
      const testData = {
        user: {
          id: BigInt(123),
          profile: {
            score: BigInt(9999),
          },
        },
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({
            user: {
              id: 123,
              profile: {
                score: 9999,
              },
            },
          });
          done();
        },
      });
    });

    it('should convert bigints in nested arrays', (done) => {
      const testData = [
        [BigInt(1), BigInt(2)],
        [BigInt(3), BigInt(4)],
      ];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual([
            [1, 2],
            [3, 4],
          ]);
          done();
        },
      });
    });

    it('should handle mixed data types', (done) => {
      const testData = {
        id: BigInt(12345),
        name: 'test',
        count: 42,
        active: true,
        tags: ['tag1', 'tag2'],
        metadata: null,
        scores: [BigInt(100), 200, BigInt(300)],
        createdAt: new Date('2024-01-01'),
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({
            id: 12345,
            name: 'test',
            count: 42,
            active: true,
            tags: ['tag1', 'tag2'],
            metadata: null,
            scores: [100, 200, 300],
            createdAt: new Date('2024-01-01'),
          });
          done();
        },
      });
    });

    it('should handle array of objects with bigints', (done) => {
      const testData = [
        { id: BigInt(1), name: 'first' },
        { id: BigInt(2), name: 'second' },
      ];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual([
            { id: 1, name: 'first' },
            { id: 2, name: 'second' },
          ]);
          done();
        },
      });
    });

    it('should handle primitive types without modification', (done) => {
      const testData = 'simple string';
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe('simple string');
          done();
        },
      });
    });

    it('should handle empty objects and arrays', (done) => {
      const testData = { empty: {}, arr: [] };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ empty: {}, arr: [] });
          done();
        },
      });
    });
  });
});
