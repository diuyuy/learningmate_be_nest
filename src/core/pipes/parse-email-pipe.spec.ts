import { Test } from '@nestjs/testing';

import { CommonException } from '../exception/common-exception';
import { ParseEmailPipe } from './parse-email-pipe';

describe('ParseEmailPipe', () => {
  let pipe: ParseEmailPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ParseEmailPipe],
    }).compile();

    pipe = moduleRef.get(ParseEmailPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should transform valid email address', () => {
      const result = pipe.transform('test@example.com');

      expect(result).toBe('test@example.com');
    });

    it('should transform email with subdomain', () => {
      const result = pipe.transform('user@mail.example.com');

      expect(result).toBe('user@mail.example.com');
    });

    it('should transform email with plus sign', () => {
      const result = pipe.transform('user+tag@example.com');

      expect(result).toBe('user+tag@example.com');
    });

    it('should transform email with dots in local part', () => {
      const result = pipe.transform('user.name@example.com');

      expect(result).toBe('user.name@example.com');
    });

    it('should transform email with numbers', () => {
      const result = pipe.transform('user123@example.com');

      expect(result).toBe('user123@example.com');
    });

    it('should transform email with Korean TLD', () => {
      const result = pipe.transform('user@example.co.kr');

      expect(result).toBe('user@example.co.kr');
    });

    it('should throw CommonException when input has no @ symbol', () => {
      expect(() => pipe.transform('invalid-email')).toThrow(CommonException);
    });

    it('should throw CommonException when input has no local part', () => {
      expect(() => pipe.transform('@example.com')).toThrow(CommonException);
    });

    it('should throw CommonException when input has no domain', () => {
      expect(() => pipe.transform('user@')).toThrow(CommonException);
    });

    it('should throw CommonException when input has no TLD', () => {
      expect(() => pipe.transform('user@example')).toThrow(CommonException);
    });

    it('should throw CommonException when input has multiple @ symbols', () => {
      expect(() => pipe.transform('user@@example.com')).toThrow(
        CommonException,
      );
    });

    it('should throw CommonException when input has spaces', () => {
      expect(() => pipe.transform('user name@example.com')).toThrow(
        CommonException,
      );
    });

    it('should throw CommonException when input is empty string', () => {
      expect(() => pipe.transform('')).toThrow(CommonException);
    });

    it('should throw CommonException when input contains invalid characters', () => {
      expect(() => pipe.transform('user!@example.com')).toThrow(
        CommonException,
      );
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
