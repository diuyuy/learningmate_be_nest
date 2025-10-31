/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';

import { CommonException } from 'src/core/exception/common-exception';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: jest.Mocked<ArticleRepository>;

  beforeEach(async () => {
    // Create mock repository
    const mockRepository = {
      findManyByKeywordId: jest.fn(),
      findById: jest.fn(),
      findArticleScraps: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(ArticleService);
    repository = moduleRef.get(ArticleRepository);

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

      repository.findManyByKeywordId.mockResolvedValue(mockArticles);

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

      expect(repository.findManyByKeywordId).toHaveBeenCalledWith(keywordId);
      expect(repository.findManyByKeywordId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no articles found', async () => {
      const keywordId = BigInt(999);

      repository.findManyByKeywordId.mockResolvedValue([]);

      const result = await service.findArticlePreviewsByKeyword(keywordId);

      expect(result).toEqual([]);
      expect(repository.findManyByKeywordId).toHaveBeenCalledWith(keywordId);
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
        keywordId: BigInt(1),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        ArticleScrap: [{ id: BigInt(1) }],
      };

      repository.findById.mockResolvedValue(mockArticle);

      const result = await service.findById(articleId, memberId);

      expect(result).toEqual({
        id: BigInt(1),
        title: 'Test Article',
        content: 'Test Content',
        publishedAt: new Date('2025-01-01'),
        summary: 'Test Summary',
        scrapCount: BigInt(5),
        views: BigInt(100),
        keywordId: BigInt(1),
      });

      expect(repository.findById).toHaveBeenCalledWith(articleId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw CommonException when article not found', async () => {
      const articleId = BigInt(999);
      const memberId = BigInt(1);

      repository.findById.mockResolvedValue(null);

      await expect(service.findById(articleId, memberId)).rejects.toThrow(
        CommonException,
      );

      try {
        await service.findById(articleId, memberId);
      } catch (error) {
        expect(error).toBeInstanceOf(CommonException);
        expect(error.getResponse()).toMatchObject({
          status: 404,
          message: '존재하지 않는 기사입니다.',
        });
      }

      expect(repository.findById).toHaveBeenCalledWith(articleId, memberId);
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
            keywordId: BigInt(1),
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
