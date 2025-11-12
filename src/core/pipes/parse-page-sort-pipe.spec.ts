import { Test } from '@nestjs/testing';

import { CommonException } from '../exception/common-exception';
import { ParsePageSortPipe } from './parse-page-sort-pipe';

type TestSortKey = 'id' | 'name' | 'createdAt';

describe('ParsePageSortPipe', () => {
  let pipe: ParsePageSortPipe<TestSortKey>;
  const validKeys: [TestSortKey, ...TestSortKey[]] = [
    'id',
    'name',
    'createdAt',
  ];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ParsePageSortPipe,
          useFactory: () => new ParsePageSortPipe<TestSortKey>(validKeys),
        },
      ],
    }).compile();

    pipe = moduleRef.get(ParsePageSortPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return default value when input is undefined', () => {
      const result = pipe.transform(undefined);

      expect(result).toEqual({
        sortProp: 'createdAt',
        sortDirection: 'desc',
      });
    });

    it('should transform valid sortProp with asc direction', () => {
      const result = pipe.transform('name,asc');

      expect(result).toEqual({
        sortProp: 'name',
        sortDirection: 'asc',
      });
    });

    it('should transform valid sortProp with desc direction', () => {
      const result = pipe.transform('id,desc');

      expect(result).toEqual({
        sortProp: 'id',
        sortDirection: 'desc',
      });
    });

    it('should use default desc direction when sortDirection is not provided', () => {
      const result = pipe.transform('name');

      expect(result).toEqual({
        sortProp: 'name',
        sortDirection: 'desc',
      });
    });

    it('should transform createdAt with desc direction', () => {
      const result = pipe.transform('createdAt,desc');

      expect(result).toEqual({
        sortProp: 'createdAt',
        sortDirection: 'desc',
      });
    });

    it('should throw CommonException when sortProp is not in validKeys', () => {
      expect(() => pipe.transform('invalidKey,asc')).toThrow(CommonException);
    });

    it('should throw CommonException when sortDirection is invalid', () => {
      expect(() => pipe.transform('name,invalid')).toThrow(CommonException);
    });

    it('should throw CommonException when sortProp is empty', () => {
      expect(() => pipe.transform(',asc')).toThrow(CommonException);
    });

    it('should throw CommonException when both sortProp and sortDirection are empty', () => {
      expect(() => pipe.transform(',')).toThrow(CommonException);
    });

    it('should throw CommonException with BAD_REQUEST status code', () => {
      try {
        pipe.transform('invalidKey,asc');
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
