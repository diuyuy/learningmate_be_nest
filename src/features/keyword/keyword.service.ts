import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import {
  KeywordResponseDto,
  TodaysKeywordResponseDto,
  UpdateKeywordDto,
} from './dto';
import { KeywordDetailResponseDto } from './dto/keyword-detail-response.dto';

@Injectable()
export class KeywordService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByPeriod(startDate: Date, endDate: Date) {
    const todaysKeywords = await this.prismaService.todaysKeyword.findMany({
      select: {
        id: true,
        date: true,
        keyword: true,
      },
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return todaysKeywords.map(TodaysKeywordResponseDto.from);
  }

  async findById(id: bigint) {
    const keyword = await this.prismaService.keyword.findUnique({
      where: {
        id,
      },
    });

    if (!keyword)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.KEYWORD_NOT_FOUND),
      );

    return KeywordResponseDto.from(keyword);
  }

  async findKeywords(
    query: string,
    category: string,
    pageAble: Pageable<KeywordSortOption>,
  ) {
    const whereCondition = this.getFindKeywordCondition(query, category);

    const [keywords, totalElements] = await Promise.all([
      this.prismaService.keyword.findMany({
        select: this.selectKeywordDetail(),
        where: whereCondition,
        skip: pageAble.page * pageAble.size,
        take: pageAble.size,
        orderBy: {
          [pageAble.sortProp]: pageAble.sortDirection,
        },
      }),
      this.prismaService.keyword.count({
        where: whereCondition,
      }),
    ]);

    const items = keywords.map(KeywordDetailResponseDto.from);

    return PageResponse.from(items, totalElements, pageAble);
  }

  async updateKeyword(
    keywordId: bigint,
    { categoryName, ...rest }: UpdateKeywordDto,
  ) {
    const category = await this.prismaService.category.findFirst({
      select: {
        id: true,
      },
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.CATEGORY_NOT_FOUND),
      );
    }

    const keyword = await this.prismaService.keyword.update({
      data: {
        category: {
          update: {
            data: {
              id: category.id,
            },
          },
        },
        ...rest,
      },
      where: {
        id: keywordId,
      },
      select: this.selectKeywordDetail(),
    });

    return KeywordDetailResponseDto.from(keyword);
  }

  private selectKeywordDetail() {
    return {
      id: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      description: true,
      name: true,
      todaysKeyword: {
        select: {
          date: true,
        },
      },
      video: {
        select: {
          id: true,
          link: true,
        },
      },
    };
  }

  private getFindKeywordCondition(query: string, category: string) {
    if (query === '') {
      return category !== 'all'
        ? {
            category: {
              name: category,
            },
          }
        : undefined;
    }

    const searchCondition = {
      OR: [
        { name: { search: query } }, // fulltext search (단어 기반)
        { name: { startsWith: query } }, // LIKE 'query%' (접두사 검색)
      ],
    };

    return category === 'all'
      ? searchCondition
      : {
          AND: [searchCondition, { category: { name: category } }],
        };
  }
}
