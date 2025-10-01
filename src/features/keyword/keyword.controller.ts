import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint-pipe';
import { ArticleService } from '../article/article.service';
import { KeywordService } from './keyword.service';

@Controller('keywords')
export class KeywordController {
  constructor(
    private readonly keywordService: KeywordService,
    private readonly articleService: ArticleService,
  ) {}

  @Get(':keywordId/articles')
  async findArticlesByKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
  ) {
    const articlePreviews =
      await this.articleService.findArticlePreviewsByKeyword(keywordId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      articlePreviews,
    );
  }
}
