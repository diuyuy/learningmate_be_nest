import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
