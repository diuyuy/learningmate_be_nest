/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';

import type { MockPrisma } from 'src/core/infrastructure/prisma-module/__mocks__/mock-prisma-service';
import { createMockPrisma } from 'src/core/infrastructure/prisma-module/__mocks__/mock-prisma-service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ArticleRepository } from './article.repository';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
  let mockPrisma: MockPrisma;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = moduleRef.get(ArticleRepository);
    mockPrisma = moduleRef.get(PrismaService);

    jest.clearAllMocks();
  });

  it('shoult be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findManyByKeywordId', () => {
    it('should return articles by keywordId', async () => {
      const keywordId = BigInt(1);
      const expectedArticles = [
        {
          id: BigInt(1),
          title: 'Test Article',
          content: 'Test Content',
          publishedAt: new Date(),
        },
      ];

      mockPrisma.article.findMany.mockResolvedValue(expectedArticles as any);

      const result = await repository.findManyByKeywordId(keywordId);

      expect(result).toEqual(expectedArticles);

      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          content: true,
          publishedAt: true,
        },
        where: {
          keywordId,
        },
      });
      expect(mockPrisma.article.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return article by id', async () => {
      const articleId = BigInt(1);
      const expectedArticle = {
        id: BigInt(1),
        title: 'Test Article',
        content: 'Test Content',
        publishedAt: new Date(),
        summary: 'Test Summary',
        scrapCount: BigInt(5),
        views: BigInt(100),
        keywordId: BigInt(1),
      };

      mockPrisma.article.findUnique.mockResolvedValue(expectedArticle as any);

      const result = await repository.findById(articleId);

      expect(result).toEqual(expectedArticle);
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: {
          id: articleId,
        },
      });
      expect(mockPrisma.article.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when article not found', async () => {
      const articleId = BigInt(999);

      mockPrisma.article.findUnique.mockResolvedValue(null);

      const result = await repository.findById(articleId);

      expect(result).toBeNull();
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: {
          id: articleId,
        },
      });
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

      const mockArticleScraps = [
        {
          article: {
            id: BigInt(1),
            title: 'Article 1',
            content: 'Content 1',
            publishedAt: new Date(),
            summary: 'Summary 1',
            scrapCount: BigInt(5),
            views: BigInt(100),
            keywordId: BigInt(1),
          },
        },
        {
          article: {
            id: BigInt(2),
            title: 'Article 2',
            content: 'Content 2',
            publishedAt: new Date(),
            summary: 'Summary 2',
            scrapCount: BigInt(3),
            views: BigInt(50),
            keywordId: BigInt(2),
          },
        },
      ];

      const totalElements = 2;

      mockPrisma.articleScrap.findMany.mockResolvedValue(
        mockArticleScraps as any,
      );
      mockPrisma.articleScrap.count.mockResolvedValue(totalElements);

      const result = await repository.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(2);
      expect(result.totalElements).toBe(2);
      expect(result.page).toBe(0);
      expect(result.size).toBe(10);
      expect(result.hasNext).toBe(false);
      expect(result.totalPages).toBe(1);

      expect(mockPrisma.articleScrap.findMany).toHaveBeenCalledWith({
        select: {
          article: true,
        },
        where: {
          memberId,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(mockPrisma.articleScrap.count).toHaveBeenCalledWith({
        where: {
          memberId,
        },
      });
    });

    it('should handle pagination with second page', async () => {
      const memberId = BigInt(1);
      const pageAble = {
        page: 1,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'asc' as const,
      };

      const mockArticleScraps = [
        {
          article: {
            id: BigInt(3),
            title: 'Article 3',
            content: 'Content 3',
            publishedAt: new Date(),
            summary: 'Summary 3',
            scrapCount: BigInt(2),
            views: BigInt(30),
            keywordId: BigInt(3),
          },
        },
      ];

      const totalElements = 11;

      mockPrisma.articleScrap.findMany.mockResolvedValue(
        mockArticleScraps as any,
      );
      mockPrisma.articleScrap.count.mockResolvedValue(totalElements);

      const result = await repository.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
      expect(result.totalElements).toBe(11);
      expect(result.hasNext).toBe(false);
      expect(result.totalPages).toBe(2);

      expect(mockPrisma.articleScrap.findMany).toHaveBeenCalledWith({
        select: {
          article: true,
        },
        where: {
          memberId,
        },
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'asc',
        },
      });
    });

    it('should handle sorting by scrapCounts', async () => {
      const memberId = BigInt(1);
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'scrapCounts' as const,
        sortDirection: 'desc' as const,
      };

      mockPrisma.articleScrap.findMany.mockResolvedValue([] as any);
      mockPrisma.articleScrap.count.mockResolvedValue(0);

      await repository.findArticleScraps(memberId, pageAble);

      expect(mockPrisma.articleScrap.findMany).toHaveBeenCalledWith({
        select: {
          article: true,
        },
        where: {
          memberId,
        },
        skip: 0,
        take: 10,
        orderBy: {
          article: {
            scrapCount: 'desc',
          },
        },
      });
    });

    it('should return empty page when no scraps found', async () => {
      const memberId = BigInt(999);
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'desc' as const,
      };

      mockPrisma.articleScrap.findMany.mockResolvedValue([] as any);
      mockPrisma.articleScrap.count.mockResolvedValue(0);

      const result = await repository.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(0);
      expect(result.totalElements).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
    });
  });

  describe('orderOption', () => {
    it('should return scrapCount order when sortProp is scrapCounts', () => {
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'scrapCounts' as const,
        sortDirection: 'desc' as const,
      };

      const result = repository.orderOption(pageAble);

      expect(result).toEqual({
        article: {
          scrapCount: 'desc',
        },
      });
    });

    it('should return default order when sortProp is not scrapCounts', () => {
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'asc' as const,
      };

      const result = repository.orderOption(pageAble);

      expect(result).toEqual({
        createdAt: 'asc',
      });
    });

    it('should handle different sort directions', () => {
      const pageAbleDesc = {
        page: 0,
        size: 10,
        sortProp: 'viewsCounts' as const,
        sortDirection: 'desc' as const,
      };

      const resultDesc = repository.orderOption(pageAbleDesc);

      expect(resultDesc).toEqual({
        article: {
          views: 'desc',
        },
      });
    });
  });
});
