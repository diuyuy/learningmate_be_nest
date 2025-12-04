/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { PageResponse } from 'src/core/api-response/page-response';
import { CACHE_PREFIX } from 'src/core/constants/cache-prfix';
import { CommonException } from 'src/core/exception/common-exception';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { Pageable } from 'src/core/types/types';
import {
  KeywordResponseDto,
  TodaysKeywordResponseDto,
  UpdateKeywordDto,
} from './dto';
import { KeywordDetailResponseDto } from './dto/keyword-detail-response.dto';
import { KeywordService } from './keyword.service';

describe('KeywordService', () => {
  let service: KeywordService;
  let mockPrisma: {
    todaysKeyword: {
      findMany: jest.Mock;
    };
    keyword: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    category: {
      findFirst: jest.Mock;
    };
  };
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    mockPrisma = {
      todaysKeyword: {
        findMany: jest.fn(),
      },
      keyword: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
    };

    const mockCacheService = {
      withCaching: jest.fn(),
      generateCacheKey: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        KeywordService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = moduleRef.get(KeywordService);
    cacheService = moduleRef.get(CacheService);

    jest.clearAllMocks();
  });

  describe('findByPeriod', () => {
    it('should return todays keywords for the given period with caching', async () => {
      // Given
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-07');
      const mockTodaysKeywords = [
        {
          id: 1n,
          date: new Date('2025-01-01'),
          Keyword: { id: 1n, name: '인플레이션' },
        },
        {
          id: 2n,
          date: new Date('2025-01-02'),
          Keyword: { id: 2n, name: '금리' },
        },
      ];

      cacheService.withCaching.mockResolvedValue(mockTodaysKeywords);

      // When
      const result = await service.findByPeriod(startDate, endDate);

      // Then
      expect(cacheService.generateCacheKey).toHaveBeenCalledWith(
        CACHE_PREFIX.KEYWORD,
        {
          startDate,
          endDate,
        },
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(TodaysKeywordResponseDto);
      expect(result[1]).toBeInstanceOf(TodaysKeywordResponseDto);
    });

    it('should return empty array when no keywords found', async () => {
      // Given
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-07');

      cacheService.withCaching.mockResolvedValue([]);

      // When
      const result = await service.findByPeriod(startDate, endDate);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return keyword when found', async () => {
      // Given
      const keywordId = 1n;
      const mockKeyword = {
        id: 1n,
        name: '인플레이션',
        description: '물가가 지속적으로 상승하는 현상',
        categoryId: 1n,
      };

      mockPrisma.keyword.findUnique.mockResolvedValue(mockKeyword);

      // When
      const result = await service.findById(keywordId);

      // Then
      expect(mockPrisma.keyword.findUnique).toHaveBeenCalledWith({
        where: {
          id: keywordId,
        },
      });
      expect(result).toBeInstanceOf(KeywordResponseDto);
    });

    it('should throw CommonException when keyword not found', async () => {
      // Given
      const keywordId = 999n;
      mockPrisma.keyword.findUnique.mockResolvedValue(null);

      // When & Then
      await expect(service.findById(keywordId)).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('findKeywords', () => {
    const mockPageable: Pageable<'name'> = {
      page: 0,
      size: 10,
      sortProp: 'name',
      sortDirection: 'asc',
    };

    it('should return paginated keywords with category filter', async () => {
      // Given
      const query = '';
      const category = '금융';
      const mockKeywords = [
        {
          id: 1n,
          name: '인플레이션',
          description: '물가 상승',
          category: { id: 1n, name: '금융' },
          todaysKeyword: [{ date: new Date('2025-01-01') }],
          video: [{ id: 1n, link: 'https://youtube.com/watch?v=123' }],
        },
      ];
      const totalElements = 1;

      mockPrisma.keyword.findMany.mockResolvedValue(mockKeywords);
      mockPrisma.keyword.count.mockResolvedValue(totalElements);

      // When
      const result = await service.findKeywords(query, category, mockPageable);

      // Then
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            Category: {
              name: category,
            },
          },
          skip: 0,
          take: 10,
          orderBy: {
            name: 'asc',
          },
        }),
      );

      expect(mockPrisma.keyword.count).toHaveBeenCalledWith({
        where: {
          Category: {
            name: category,
          },
        },
      });
      expect(result).toBeInstanceOf(PageResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(KeywordDetailResponseDto);
      expect(result.totalElements).toBe(totalElements);
    });

    it('should return paginated keywords with search query and category "all"', async () => {
      // Given
      const query = '인플레';
      const category = 'all';
      const mockKeywords = [
        {
          id: 1n,
          name: '인플레이션',
          description: '물가 상승',
          Category: { id: 1n, name: '금융' },
          todaysKeyword: [{ date: new Date('2025-01-01') }],
          video: [{ id: 1n, link: 'https://youtube.com/watch?v=123' }],
        },
      ];
      const totalElements = 1;

      mockPrisma.keyword.findMany.mockResolvedValue(mockKeywords);
      mockPrisma.keyword.count.mockResolvedValue(totalElements);

      // When
      const result = await service.findKeywords(query, category, mockPageable);

      // Then
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ name: { search: query } }, { name: { startsWith: query } }],
          },
          skip: 0,
          take: 10,
          orderBy: {
            name: 'asc',
          },
        }),
      );
      expect(result.items).toHaveLength(1);
    });

    it('should return paginated keywords with search query and specific category', async () => {
      // Given
      const query = '인플레';
      const category = '금융';
      const mockKeywords = [];
      const totalElements = 0;

      mockPrisma.keyword.findMany.mockResolvedValue(mockKeywords);
      mockPrisma.keyword.count.mockResolvedValue(totalElements);

      // When
      const result = await service.findKeywords(query, category, mockPageable);

      // Then
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                OR: [
                  { name: { search: query } },
                  { name: { startsWith: query } },
                ],
              },
              { Category: { name: category } },
            ],
          },
          skip: 0,
          take: 10,
          orderBy: {
            name: 'asc',
          },
        }),
      );
      expect(result.items).toHaveLength(0);
    });

    it('should return all keywords when query is empty and category is "all"', async () => {
      // Given
      const query = '';
      const category = 'all';
      const mockKeywords = [
        {
          id: 1n,
          name: '인플레이션',
          description: '물가 상승',
          Category: { id: 1n, name: '금융' },
          todaysKeyword: [],
          video: [],
        },
        {
          id: 2n,
          name: '금리',
          description: '이자율',
          Category: { id: 1n, name: '금융' },
          todaysKeyword: [],
          video: [],
        },
      ];
      const totalElements = 2;

      mockPrisma.keyword.findMany.mockResolvedValue(mockKeywords);
      mockPrisma.keyword.count.mockResolvedValue(totalElements);

      // When
      const result = await service.findKeywords(query, category, mockPageable);

      // Then
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
          skip: 0,
          take: 10,
          orderBy: {
            name: 'asc',
          },
        }),
      );
      expect(result.items).toHaveLength(2);
    });

    it('should handle pagination correctly', async () => {
      // Given
      const query = '';
      const category = 'all';
      const pageableSecondPage: Pageable<'name'> = {
        page: 1,
        size: 5,
        sortProp: 'name',
        sortDirection: 'desc',
      };

      mockPrisma.keyword.findMany.mockResolvedValue([]);
      mockPrisma.keyword.count.mockResolvedValue(0);

      // When
      await service.findKeywords(query, category, pageableSecondPage);

      // Then
      expect(mockPrisma.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
          skip: 5, // page 1 * size 5
          take: 5,
          orderBy: {
            name: 'desc',
          },
        }),
      );
    });
  });

  describe('updateKeyword', () => {
    it('should update keyword successfully', async () => {
      // Given
      const keywordId = 1n;
      const updateDto: UpdateKeywordDto = {
        name: '수정된 인플레이션',
        categoryName: '금융',
        description: '수정된 설명',
      };
      const mockCategory = { id: 1n };
      const mockUpdatedKeyword = {
        id: 1n,
        name: '수정된 인플레이션',
        description: '수정된 설명',
        Category: { id: 1n, name: '금융' },
        todaysKeyword: [],
        video: [],
      };

      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.keyword.update.mockResolvedValue(mockUpdatedKeyword);

      // When
      const result = await service.updateKeyword(keywordId, updateDto);

      // Then
      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        select: {
          id: true,
        },
        where: {
          name: updateDto.categoryName,
        },
      });
      expect(mockPrisma.keyword.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            Category: {
              update: {
                data: {
                  id: mockCategory.id,
                },
              },
            },
            name: updateDto.name,
            description: updateDto.description,
          },
          where: {
            id: keywordId,
          },
        }),
      );
      expect(result).toBeInstanceOf(KeywordDetailResponseDto);
    });

    it('should throw CommonException when category not found', async () => {
      // Given
      const keywordId = 1n;
      const updateDto: UpdateKeywordDto = {
        name: '수정된 인플레이션',
        categoryName: '존재하지않는카테고리',
        description: '수정된 설명',
      };

      mockPrisma.category.findFirst.mockResolvedValue(null);

      // When & Then
      await expect(service.updateKeyword(keywordId, updateDto)).rejects.toThrow(
        CommonException,
      );
      expect(mockPrisma.keyword.update).not.toHaveBeenCalled();
    });
  });
});
