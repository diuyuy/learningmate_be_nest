import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { S3Module } from 'src/core/infrastructure/s3/s3.module';
import { ReviewModule } from '../review/review.module';
import { StatisticModule } from '../statistic/statistic.module';
import { StudyModule } from '../study/study.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [PrismaModule, StudyModule, ReviewModule, S3Module, StatisticModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
