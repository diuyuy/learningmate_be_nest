import { Test } from '@nestjs/testing';

import { CommonException } from '../exception/common-exception';
import { ParseCategoryPipe } from './parse-category-pipe';

describe('ParseCategoryPipe', () => {
  let pipe: ParseCategoryPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ParseCategoryPipe],
    }).compile();

    pipe = moduleRef.get(ParseCategoryPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return "all" when value is undefined', () => {
      const result = pipe.transform(undefined);

      expect(result).toBe('all');
    });

    it('should return "all" when value is empty string', () => {
      const result = pipe.transform('');

      expect(result).toBe('all');
    });

    it('should transform valid category "all"', () => {
      const result = pipe.transform('all');

      expect(result).toBe('all');
    });

    it('should transform valid category "과학"', () => {
      const result = pipe.transform('과학');

      expect(result).toBe('과학');
    });

    it('should transform valid category "공공"', () => {
      const result = pipe.transform('공공');

      expect(result).toBe('공공');
    });

    it('should transform valid category "경제"', () => {
      const result = pipe.transform('경제');

      expect(result).toBe('경제');
    });

    it('should transform valid category "금융"', () => {
      const result = pipe.transform('금융');

      expect(result).toBe('금융');
    });

    it('should transform valid category "사회"', () => {
      const result = pipe.transform('사회');

      expect(result).toBe('사회');
    });

    it('should transform valid category "경영"', () => {
      const result = pipe.transform('경영');

      expect(result).toBe('경영');
    });

    it('should throw CommonException when input is invalid category', () => {
      expect(() => pipe.transform('invalid')).toThrow(CommonException);
    });

    it('should throw CommonException when input is a number', () => {
      expect(() => pipe.transform('123')).toThrow(CommonException);
    });

    it('should throw CommonException when input is mixed characters', () => {
      expect(() => pipe.transform('경제123')).toThrow(CommonException);
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
