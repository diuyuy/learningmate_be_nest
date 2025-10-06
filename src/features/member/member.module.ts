import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import { ReviewModule } from '../review/review.module';
import { StudyModule } from '../study/study.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { S3Service } from './s3.service';

@Module({
  imports: [PrismaModule, StudyModule, ReviewModule],
  controllers: [MemberController],
  providers: [MemberService, S3Service],
  exports: [MemberService],
})
export class MemberModule {}
