/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';

import { CommonException } from 'src/core/exception/common-exception';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: jest.Mocked<ArticleRepository>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    // Create mock repository
    const mockRepository = {
      findManyByKeywordId: jest.fn(),
      findById: jest.fn(),
      findArticleScraps: jest.fn(),
      isScrappedByMember: jest.fn(),
    };

    const mockCacheService = {
      withCaching: jest.fn(),
      generateCacheKey: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: mockRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = moduleRef.get(ArticleService);
    repository = moduleRef.get(ArticleRepository);
    cacheService = moduleRef.get(CacheService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findArticlePreviewsByKeyword', () => {
    it('should return article previews for given keywordId', async () => {
      const keywordId = BigInt(1);
      const mockArticles = [
        {
          id: BigInt(1),
          title: 'Test Article 1',
          content: 'Test Content 1',
          publishedAt: new Date('2025-01-01'),
        },
        {
          id: BigInt(2),
          title: 'Test Article 2',
          content: 'Test Content 2',
          publishedAt: new Date('2025-01-02'),
        },
      ];

      cacheService.withCaching.mockResolvedValue(mockArticles);

      const result = await service.findArticlePreviewsByKeyword(keywordId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: BigInt(1),
        title: 'Test Article 1',
        content: 'Test Content 1',
        publishedAt: new Date('2025-01-01'),
      });
      expect(result[1]).toEqual({
        id: BigInt(2),
        title: 'Test Article 2',
        content: 'Test Content 2',
        publishedAt: new Date('2025-01-02'),
      });

      expect(cacheService.withCaching).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no articles found', async () => {
      const keywordId = BigInt(999);

      cacheService.withCaching.mockResolvedValue([]);

      const result = await service.findArticlePreviewsByKeyword(keywordId);

      expect(result).toEqual([]);
      expect(cacheService.withCaching).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return article when found', async () => {
      const articleId = BigInt(1);
      const memberId = BigInt(1);
      const mockArticle = {
        id: BigInt(1),
        title: 'Test Article',
        content: 'Test Content',
        publishedAt: new Date('2025-01-01'),
        summary: 'Test Summary',
        scrapCount: BigInt(5),
        views: BigInt(100),
        keyword: {
          id: BigInt(1),
          name: 'Test Keyword',
        },
      };

      cacheService.withCaching.mockResolvedValue(mockArticle);
      repository.isScrappedByMember.mockResolvedValue(true);

      const result = await service.findById(articleId, memberId);

      expect(result).toMatchObject({
        id: BigInt(1),
        title: 'Test Article',
        content: 'Test Content',
        publishedAt: new Date('2025-01-01'),
        summary: 'Test Summary',
        scrapCount: BigInt(5),
        views: BigInt(100),
        scrappedByMe: true,
      });

      expect(cacheService.withCaching).toHaveBeenCalledTimes(1);
      expect(repository.isScrappedByMember).toHaveBeenCalledWith(
        articleId,
        memberId,
      );
    });

    it('should throw CommonException when article not found', async () => {
      const articleId = BigInt(999);
      const memberId = BigInt(1);

      cacheService.withCaching.mockResolvedValue(null);

      await expect(service.findById(articleId, memberId)).rejects.toThrow(
        CommonException,
      );

      expect(cacheService.withCaching).toHaveBeenCalledTimes(1);
    });
  });

  describe('findArticleScraps', () => {
    it('should return paginated article scraps', async () => {
      const memberId = BigInt(1);
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'desc' as const,
      };

      const mockPageResponse = {
        items: [
          {
            id: BigInt(1),
            title: 'Article 1',
            content: 'Content 1',
            publishedAt: new Date(),
            summary: 'Summary 1',
            scrapCount: BigInt(5),
            views: BigInt(100),
            keyword: {
              id: BigInt(1),
              name: 'Keyword 1',
              description: 'Description 1',
              date: new Date(),
            },
            scrappedByMe: true,
          },
        ],
        page: 0,
        size: 10,
        hasNext: false,
        totalElements: 1,
        totalPages: 1,
      };

      repository.findArticleScraps.mockResolvedValue(mockPageResponse);

      const result = await service.findArticleScraps(memberId, pageAble);

      expect(result).toEqual(mockPageResponse);
      expect(repository.findArticleScraps).toHaveBeenCalledWith(
        memberId,
        pageAble,
      );
      expect(repository.findArticleScraps).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      const memberId = BigInt(999);
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'desc' as const,
      };

      const mockEmptyPageResponse = {
        items: [],
        page: 0,
        size: 10,
        hasNext: false,
        totalElements: 0,
        totalPages: 0,
      };

      repository.findArticleScraps.mockResolvedValue(mockEmptyPageResponse);

      const result = await service.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(0);
      expect(result.totalElements).toBe(0);
      expect(repository.findArticleScraps).toHaveBeenCalledWith(
        memberId,
        pageAble,
      );
    });
    it('should pass through sorting options correctly', async () => {
      const memberId = BigInt(1);
      const pageAble = {
        page: 1,
        size: 20,
        sortProp: 'scrapCounts' as const,
        sortDirection: 'asc' as const,
      };

      const mockPageResponse = {
        items: [],
        page: 1,
        size: 20,
        hasNext: false,
        totalElements: 0,
        totalPages: 0,
      };

      repository.findArticleScraps.mockResolvedValue(mockPageResponse);

      await service.findArticleScraps(memberId, pageAble);

      expect(repository.findArticleScraps).toHaveBeenCalledWith(
        memberId,
        pageAble,
      );
    });
  });
});
