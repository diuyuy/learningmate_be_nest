import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import { ArticleModule } from '../article/article.module';
import { VideoModule } from '../video/video.module';
import { KeywordController } from './keyword.controller';
import { KeywordService } from './keyword.service';

@Module({
  imports: [PrismaModule, ArticleModule, VideoModule],
  controllers: [KeywordController],
  providers: [KeywordService],
})
export class KeywordModule {}
