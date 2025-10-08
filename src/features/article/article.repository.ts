import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ArticleScrapSortOption, Pageable } from 'src/core/types/types';
import { ArticleResponseDto } from './dto/article-response.dto';

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
          article: true,
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
      ArticleResponseDto.from(article),
    );

    return PageResponse.from(articles, totalElements, pageAble);
  }

  orderOption(pageAble: Pageable<ArticleScrapSortOption>) {
    if (pageAble.sortProp === 'scrapCounts') {
      return {
        article: {
          scrapCount: pageAble.sortDirection,
        },
      };
    }

    return {
      [pageAble.sortProp]: pageAble.sortDirection,
    };
  }
}
