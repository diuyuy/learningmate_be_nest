import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import { QuizModule } from '../quiz/quiz.module';
import { ReviewModule } from '../review/review.module';
import { ArticleController } from './article.controller';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';

@Module({
  imports: [PrismaModule, QuizModule, ReviewModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService],
})
export class ArticleModule {}
