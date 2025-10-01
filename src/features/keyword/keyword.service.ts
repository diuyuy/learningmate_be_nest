import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
import { KeywordResponseDto, TodaysKeywordResponseDto } from './dto';

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
}
