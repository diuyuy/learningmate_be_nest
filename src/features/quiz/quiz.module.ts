import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { StudyModule } from '../study/study.module';
import { QuizService } from './quiz.service';

@Module({
  imports: [PrismaModule, StudyModule],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
