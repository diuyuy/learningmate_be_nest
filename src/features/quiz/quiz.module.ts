import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { StudyModule } from '../study/study.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [PrismaModule, StudyModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
