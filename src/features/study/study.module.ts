import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import { StudyController } from './study.controller';
import { StudyRepository } from './study.repository';
import { StudyService } from './study.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService, StudyRepository],
})
export class StudyModule {}
