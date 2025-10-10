import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { StudyService } from './study.service';

@Module({
  imports: [PrismaModule],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
