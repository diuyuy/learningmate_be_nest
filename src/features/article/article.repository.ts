import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ArticleScrapSortOption, Pageable } from 'src/core/types/types';
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

  async findById(id: bigint) {
    return this.prismaService.article.findUnique({
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
        id,
      },
    });
  }

  async isScrappedByMember(articleId: bigint, memberId: bigint) {
    const articleScrap = await this.prismaService.article_scrap.findUnique({
      select: {
        id: true,
      },
      where: {
        member_id_article_id: {
          member_id: memberId,
          article_id: articleId,
        },
      },
    });

    return !!articleScrap;
  }

  async findArticleScraps(
    memberId: bigint,
    pageAble: Pageable<ArticleScrapSortOption>,
  ): Promise<PageResponse<ScrappedArticleResponseDto>> {
    const [articleScraps, totalElements] = await Promise.all([
      this.prismaService.article_scrap.findMany({
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
        skip: pageAble.page * pageAble.size,
        take: pageAble.size,
        orderBy: this.orderOption(pageAble),
      }),
      this.prismaService.article_scrap.count({
        where: {
          member_id: memberId,
        },
      }),
    ]);

    const articles = articleScraps.map(({ Article }) =>
      ScrappedArticleResponseDto.from({ ...Article, scrappedByMe: true }),
    );

    return PageResponse.from(articles, totalElements, pageAble);
  }

  async scrapArticle(memberId: bigint, articleId: bigint) {
    await this.prismaService.article_scrap.upsert({
      create: {
        article_id: articleId,
        member_id: memberId,
      },
      update: {},
      where: {
        member_id_article_id: {
          member_id: memberId,
          article_id: articleId,
        },
      },
    });
  }

  async cancelScrap(memberId: bigint, articleId: bigint) {
    await this.prismaService.article_scrap.delete({
      where: {
        member_id_article_id: {
          member_id: memberId,
          article_id: articleId,
        },
      },
    });
  }

  async updateArticle(articleId: bigint, updateArticleDto: UpdateArticleDto) {
    await this.prismaService.article.update({
      data: {
        ...updateArticleDto,
      },
      where: {
        id: articleId,
      },
    });
  }

  orderOption(pageAble: Pageable<ArticleScrapSortOption>) {
    if (pageAble.sortProp === 'scrapCounts') {
      return {
        Article: {
          scrapCount: pageAble.sortDirection,
        },
      };
    }

    if (pageAble.sortProp === 'viewsCounts') {
      return {
        Article: {
          views: pageAble.sortDirection,
        },
      };
    }

    return {
      created_at: pageAble.sortDirection,
    };
  }
}
