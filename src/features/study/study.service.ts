import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { MyStudyResponseDto } from './dto';

@Injectable()
export class StudyService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStudyStatus({
    memberId,
    year,
    month,
  }: {
    memberId: bigint;
    year: number;
    month: number;
  }) {
    if (month < 1 || month > 12) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_MONTH_VALUE),
      );
    }

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const studyStatus = await this.prismaService.study.findMany({
      where: {
        memberId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return studyStatus.map(MyStudyResponseDto.from);
  }
}
