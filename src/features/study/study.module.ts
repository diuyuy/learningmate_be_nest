import { Module } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule {}
