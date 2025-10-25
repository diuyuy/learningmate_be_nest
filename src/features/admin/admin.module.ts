import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { ArticleModule } from '../article/article.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordModule } from '../keyword/keyword.module';
import { QuizModule } from '../quiz/quiz.module';
import { VideoModule } from '../video/video.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ArticleModule,
    VideoModule,
    KeywordModule,
    QuizModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
