import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import { KeywordResponseDto, TodaysKeywordResponseDto } from './dto';
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

  async findKeywords(pageAble: Pageable<KeywordSortOption>) {
    const [keywords, totalElements] = await Promise.all([
      this.prismaService.keyword.findMany({
        select: {
          id: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          description: true,
          name: true,
          video: {
            select: {
              id: true,
              link: true,
            },
          },
        },
        skip: pageAble.page * pageAble.size,
        take: pageAble.size,
        orderBy: {
          [pageAble.sortProp]: pageAble.sortDirection,
        },
      }),
      this.prismaService.keyword.count(),
    ]);

    const items = keywords.map(KeywordDetailResponseDto.from);

    return PageResponse.from(items, totalElements, pageAble);
  }
}
