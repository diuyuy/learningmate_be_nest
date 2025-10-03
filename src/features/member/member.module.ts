import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import { ReviewModule } from '../review/review.module';
import { StudyModule } from '../study/study.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [PrismaModule, StudyModule, ReviewModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
