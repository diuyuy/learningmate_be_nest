import { Test } from '@nestjs/testing';

import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ArticleRepository } from './article.repository';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
  let mockPrisma: {
    article: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    article_scrap: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockPrisma = {
      article: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      article_scrap: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

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

      mockPrisma.article.findMany.mockResolvedValue(expectedArticles);

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
        Keyword: {
          id: BigInt(1),
          name: 'Test Keyword',
        },
      };

      mockPrisma.article.findUnique.mockResolvedValue(expectedArticle);

      const result = await repository.findById(articleId);

      expect(result).toEqual(expectedArticle);
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          content: true,
          publishedAt: true,
          Keyword: {
            select: {
              id: true,
              name: true,
            },
          },
          scrapCount: true,
          summary: true,
          title: true,
          views: true,
        },
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
        select: {
          id: true,
          content: true,
          publishedAt: true,
          Keyword: {
            select: {
              id: true,
              name: true,
            },
          },
          scrapCount: true,
          summary: true,
          title: true,
          views: true,
        },
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
          Article: {
            id: BigInt(1),
            title: 'Article 1',
            content: 'Content 1',
            publishedAt: new Date(),
            summary: 'Summary 1',
            scrapCount: BigInt(5),
            views: BigInt(100),
            Keyword: {
              id: BigInt(1),
              description: 'Keyword 1 description',
              name: 'Keyword 1',
              TodaysKeyword: [
                {
                  date: new Date(),
                },
              ],
            },
          },
        },
        {
          Article: {
            id: BigInt(2),
            title: 'Article 2',
            content: 'Content 2',
            publishedAt: new Date(),
            summary: 'Summary 2',
            scrapCount: BigInt(3),
            views: BigInt(50),
            Keyword: {
              id: BigInt(2),
              description: 'Keyword 2 description',
              name: 'Keyword 2',
              TodaysKeyword: [
                {
                  date: new Date(),
                },
              ],
            },
          },
        },
      ];

      const totalElements = 2;

      mockPrisma.article_scrap.findMany.mockResolvedValue(mockArticleScraps);
      mockPrisma.article_scrap.count.mockResolvedValue(totalElements);

      const result = await repository.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(2);
      expect(result.totalElements).toBe(2);
      expect(result.page).toBe(0);
      expect(result.size).toBe(10);
      expect(result.hasNext).toBe(false);
      expect(result.totalPages).toBe(1);

      expect(mockPrisma.article_scrap.findMany).toHaveBeenCalledWith({
        select: {
          Article: {
            select: {
              id: true,
              content: true,
              publishedAt: true,
              summary: true,
              title: true,
              scrapCount: true,
              views: true,
              Keyword: {
                select: {
                  id: true,
                  description: true,
                  name: true,
                  TodaysKeyword: {
                    select: {
                      date: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          member_id: memberId,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(mockPrisma.article_scrap.count).toHaveBeenCalledWith({
        where: {
          member_id: memberId,
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
          Article: {
            id: BigInt(3),
            title: 'Article 3',
            content: 'Content 3',
            publishedAt: new Date(),
            summary: 'Summary 3',
            scrapCount: BigInt(2),
            views: BigInt(30),
            Keyword: {
              id: BigInt(3),
              description: 'Keyword 3 description',
              name: 'Keyword 3',
              TodaysKeyword: [
                {
                  date: new Date(),
                },
              ],
            },
          },
        },
      ];

      const totalElements = 11;

      mockPrisma.article_scrap.findMany.mockResolvedValue(mockArticleScraps);
      mockPrisma.article_scrap.count.mockResolvedValue(totalElements);

      const result = await repository.findArticleScraps(memberId, pageAble);

      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
      expect(result.totalElements).toBe(11);
      expect(result.hasNext).toBe(false);
      expect(result.totalPages).toBe(2);

      expect(mockPrisma.article_scrap.findMany).toHaveBeenCalledWith({
        select: {
          Article: {
            select: {
              id: true,
              content: true,
              publishedAt: true,
              summary: true,
              title: true,
              scrapCount: true,
              views: true,
              Keyword: {
                select: {
                  id: true,
                  description: true,
                  name: true,
                  TodaysKeyword: {
                    select: {
                      date: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          member_id: memberId,
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

      mockPrisma.article_scrap.findMany.mockResolvedValue([]);
      mockPrisma.article_scrap.count.mockResolvedValue(0);

      await repository.findArticleScraps(memberId, pageAble);

      expect(mockPrisma.article_scrap.findMany).toHaveBeenCalledWith({
        select: {
          Article: {
            select: {
              id: true,
              content: true,
              publishedAt: true,
              summary: true,
              title: true,
              scrapCount: true,
              views: true,
              Keyword: {
                select: {
                  id: true,
                  description: true,
                  name: true,
                  TodaysKeyword: {
                    select: {
                      date: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          member_id: memberId,
        },
        skip: 0,
        take: 10,
        orderBy: {
          Article: {
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

      mockPrisma.article_scrap.findMany.mockResolvedValue([]);
      mockPrisma.article_scrap.count.mockResolvedValue(0);

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
        Article: {
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
        Article: {
          views: 'desc',
        },
      });
    });
  });
});
