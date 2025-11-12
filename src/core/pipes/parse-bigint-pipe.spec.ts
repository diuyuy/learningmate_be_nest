import { Test } from '@nestjs/testing';

import { CommonException } from '../exception/common-exception';
import { ParseBigIntPipe } from './parse-bigint-pipe';

describe('ParseBigIntPipe', () => {
  let pipe: ParseBigIntPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ParseBigIntPipe],
    }).compile();

    pipe = moduleRef.get(ParseBigIntPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should transform valid positive number string to bigint', () => {
      const result = pipe.transform('123');

      expect(result).toBe(BigInt(123));
      expect(typeof result).toBe('bigint');
    });

    it('should transform valid negative number string to bigint', () => {
      const result = pipe.transform('-456');

      expect(result).toBe(BigInt(-456));
      expect(typeof result).toBe('bigint');
    });

    it('should transform zero string to bigint', () => {
      const result = pipe.transform('0');

      expect(result).toBe(BigInt(0));
    });

    it('should transform large number string to bigint', () => {
      const largeNumber = '9007199254740991999'; // Larger than Number.MAX_SAFE_INTEGER

      const result = pipe.transform(largeNumber);

      expect(result).toBe(BigInt(largeNumber));
    });

    it('should throw CommonException when input is not a valid number', () => {
      expect(() => pipe.transform('abc')).toThrow(CommonException);
    });

    it('should transform empty string to bigint zero', () => {
      const result = pipe.transform('');

      expect(result).toBe(BigInt(0));
    });

    it('should throw CommonException when input contains invalid characters', () => {
      expect(() => pipe.transform('123abc')).toThrow(CommonException);
    });

    it('should throw CommonException when input is a floating point number', () => {
      expect(() => pipe.transform('123.456')).toThrow(CommonException);
    });

    it('should throw CommonException with BAD_REQUEST status code', () => {
      try {
        pipe.transform('invalid');
        fail('Expected CommonException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CommonException);
        const response = (error as CommonException).getResponse() as {
          status: number;
          message: string;
        };
        expect(response.status).toBe(400);
      }
    });
  });
});
