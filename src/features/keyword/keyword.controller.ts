import {
  Controller,
  Get,
  Param,
  ParseDatePipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint-pipe';
import { ParseNonNegativeIntPipe } from 'src/common/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/common/pipes/parse-page-sort-pipe';
import type { PageSortOption, ReviewSortOption } from 'src/common/types/types';
import { ArticleService } from '../article/article.service';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { ReviewService } from '../review/review.service';
import { VideoService } from '../video/video.service';
import { KeywordService } from './keyword.service';

@Controller('keywords')
export class KeywordController {
  constructor(
    private readonly keywordService: KeywordService,
    private readonly articleService: ArticleService,
    private readonly reviewService: ReviewService,
    private readonly videoService: VideoService,
  ) {}

  @Get()
  async findTodaysKeywords(
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    const todaysKeywords = await this.keywordService.findByPeriod(
      startDate,
      endDate,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      todaysKeywords,
    );
  }

  @Get(':keywordId')
  async findById(@Param('keywordId', ParseBigIntPipe) keywordId: bigint) {
    const keyword = await this.keywordService.findById(keywordId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      keyword,
    );
  }

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

  @Get(':keywordId/reviews')
  async findReviewsByKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
    @Query('page', ParseNonNegativeIntPipe) page: number,
    @Query('size', ParseNonNegativeIntPipe) size: number,
    @Query(
      'sort',
      new ParsePageSortPipe<ReviewSortOption>([
        'createdAt',
        'updatedAt',
        'likeCounts',
      ]),
    )
    sortOption: PageSortOption<ReviewSortOption>,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);
    const pageAble = { page, size, ...sortOption };

    const pageReviewResponse = await this.reviewService.findReviewsByKeyword({
      memberId,
      keywordId,
      pageAble,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      pageReviewResponse,
    );
  }

  @Get(':keywordId/videos')
  async findVideoByKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
  ) {
    const video = await this.videoService.findByKeywordId(keywordId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      video,
    );
  }
}
