import { Test } from '@nestjs/testing';

import { CommonException } from '../exception/common-exception';
import { ParseNonNegativeIntPipe } from './parse-nonnegative-int-pipe';

describe('ParseNonNegativeIntPipe', () => {
  let pipe: ParseNonNegativeIntPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ParseNonNegativeIntPipe],
    }).compile();

    pipe = moduleRef.get(ParseNonNegativeIntPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should transform valid positive number string to number', () => {
      const result = pipe.transform('123');

      expect(result).toBe(123);
      expect(typeof result).toBe('number');
    });

    it('should transform zero string to number', () => {
      const result = pipe.transform('0');

      expect(result).toBe(0);
    });

    it('should transform large positive number string to number', () => {
      const largeNumber = '999999999';

      const result = pipe.transform(largeNumber);

      expect(result).toBe(999999999);
    });

    it('should throw CommonException when input is negative number', () => {
      expect(() => pipe.transform('-123')).toThrow(CommonException);
    });

    it('should throw CommonException when input is not a valid number', () => {
      expect(() => pipe.transform('abc')).toThrow(CommonException);
    });

    it('should transform empty string to zero', () => {
      const result = pipe.transform('');

      expect(result).toBe(0);
    });

    it('should throw CommonException when input contains invalid characters', () => {
      expect(() => pipe.transform('123abc')).toThrow(CommonException);
    });

    it('should transform floating point number string to number', () => {
      const result = pipe.transform('123.456');

      expect(result).toBe(123.456);
    });

    it('should throw CommonException when input is negative floating point', () => {
      expect(() => pipe.transform('-123.456')).toThrow(CommonException);
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
