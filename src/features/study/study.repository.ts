import { Injectable } from '@nestjs/common';
import { upsertStudyFlag } from 'generated/prisma/sql';
import { PrismaService } from '../../common/prisma-module/prisma.service';

@Injectable()
export class StudyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertFlag(memberId: bigint, keywordId: bigint, flag: number) {
    await this.prismaService.$queryRawTyped(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      upsertStudyFlag(memberId, keywordId, flag, flag),
    );
  }
}
