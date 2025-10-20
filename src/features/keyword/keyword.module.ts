import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { ArticleModule } from '../article/article.module';
import { ReviewModule } from '../review/review.module';
import { VideoModule } from '../video/video.module';
import { KeywordController } from './keyword.controller';
import { KeywordService } from './keyword.service';

@Module({
  imports: [PrismaModule, ArticleModule, ReviewModule, VideoModule],
  controllers: [KeywordController],
  providers: [KeywordService],
  exports: [KeywordService],
})
export class KeywordModule {}
