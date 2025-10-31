import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ArticleScrapSortOption, Pageable } from 'src/core/types/types';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { ScrappedArticleResponseDto } from './dto/scrapped-article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly previewSelect = {
    id: true,
    title: true,
    content: true,
    publishedAt: true,
  } as const;

  async findManyByKeywordId(keywordId: bigint) {
    return this.prismaService.article.findMany({
      select: this.previewSelect,
      where: {
        keywordId,
      },
    });
  }

  async findById(id: bigint, memberId: bigint) {
    return this.prismaService.article.findUnique({
      select: {
        id: true,
        content: true,
        publishedAt: true,
        keywordId: true,
        scrapCount: true,
        summary: true,
        title: true,
        views: true,
        ArticleScrap: {
          select: {
            id: true,
          },
          where: {
            memberId,
          },
        },
      },
      where: {
        id,
      },
    });
  }

  async findArticleScraps(
    memberId: bigint,
    pageAble: Pageable<ArticleScrapSortOption>,
  ) {
    const [articleScraps, totalElements] = await Promise.all([
      this.prismaService.articleScrap.findMany({
        select: {
          article: {
            select: {
              id: true,
              content: true,
              publishedAt: true,
              summary: true,
              title: true,
              scrapCount: true,
              views: true,
              keyword: {
                select: {
                  id: true,
                  description: true,
                  name: true,
                  todaysKeyword: {
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
          memberId,
        },
        skip: pageAble.page * pageAble.size,
        take: pageAble.size,
        orderBy: this.orderOption(pageAble),
      }),
      this.prismaService.articleScrap.count({
        where: {
          memberId,
        },
      }),
    ]);

    const articles = articleScraps.map(({ article }) =>
      ScrappedArticleResponseDto.from({ ...article, scrappedByMe: true }),
    );

    return PageResponse.from(articles, totalElements, pageAble);
  }

  async scrapArticle(memberId: bigint, articleId: bigint) {
    await this.prismaService.articleScrap.upsert({
      create: {
        articleId,
        memberId,
      },
      update: {},
      where: {
        memberId_articleId: {
          memberId,
          articleId,
        },
      },
    });
  }

  async cancelScrap(memberId: bigint, articleId: bigint) {
    await this.prismaService.articleScrap.delete({
      where: {
        memberId_articleId: {
          memberId,
          articleId,
        },
      },
    });
  }

  async createArticle(keywordId: bigint, createArticleDto: CreateArticleDto) {
    const newArticle = await this.prismaService.article.create({
      data: {
        keywordId,
        ...createArticleDto,
        publishedAt: new Date(),
        summary: '',
      },
    });

    return ArticleResponseDto.from(newArticle);
  }

  async updateArticle(articleId: bigint, updateArticleDto: UpdateArticleDto) {
    const article = await this.prismaService.article.update({
      data: {
        ...updateArticleDto,
      },
      where: {
        id: articleId,
      },
    });

    return ArticleResponseDto.from(article);
  }

  orderOption(pageAble: Pageable<ArticleScrapSortOption>) {
    if (pageAble.sortProp === 'scrapCounts') {
      return {
        article: {
          scrapCount: pageAble.sortDirection,
        },
      };
    }

    if (pageAble.sortProp === 'viewsCounts') {
      return {
        article: {
          views: pageAble.sortDirection,
        },
      };
    }

    return {
      [pageAble.sortProp]: pageAble.sortDirection,
    };
  }
}
