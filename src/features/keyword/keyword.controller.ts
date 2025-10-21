import {
  Controller,
  Get,
  Param,
  ParseDatePipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/core/api-response/api-response';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { ParseBigIntPipe } from 'src/core/pipes/parse-bigint-pipe';
import { ParseNonNegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort-pipe';
import type { PageSortOption, ReviewSortOption } from 'src/core/types/types';
import { ArticleService } from '../article/article.service';
import { ArticlePreviewResponseDto } from '../article/dto/article-preview-response.dto';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { PageReviewCountResponseDto } from '../review/dto';
import { PageReviewResponseDto } from '../review/dto/page-review-response.dto';
import { ReviewService } from '../review/review.service';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { VideoService } from '../video/video.service';
import { KeywordResponseDto } from './dto/keyword-response.dto';
import { TodaysKeywordResponseDto } from './dto/todays-keyword-response.dto';
import { KeywordService } from './keyword.service';

@ApiTags('Keyword')
@ApiExtraModels(
  ApiResponse,
  PageResponse,
  KeywordResponseDto,
  TodaysKeywordResponseDto,
  ArticlePreviewResponseDto,
  PageReviewResponseDto,
  PageReviewCountResponseDto,
  VideoResponseDto,
)
@Controller('v1/keywords')
export class KeywordController {
  constructor(
    private readonly keywordService: KeywordService,
    private readonly articleService: ArticleService,
    private readonly reviewService: ReviewService,
    private readonly videoService: VideoService,
  ) {}

  @ApiOperation({ summary: '기간별 오늘의 키워드 조회' })
  @ApiQuery({ name: 'startDate', description: '시작 날짜', type: Number })
  @ApiQuery({ name: 'endDate', description: '종료 날짜', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '오늘의 키워드 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(TodaysKeywordResponseDto) },
            },
          },
        },
      ],
    },
  })
  @Get()
  async findTodaysKeywords(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
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

  @ApiOperation({ summary: '키워드 상세 조회' })
  @ApiParam({ name: 'keywordId', description: '키워드 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '키워드 상세 정보 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: { $ref: getSchemaPath(KeywordResponseDto) },
          },
        },
      ],
    },
  })
  @Get(':keywordId')
  async findById(@Param('keywordId', ParseBigIntPipe) keywordId: bigint) {
    const keyword = await this.keywordService.findById(keywordId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      keyword,
    );
  }

  @ApiOperation({ summary: '키워드별 기사 목록 조회' })
  @ApiParam({ name: 'keywordId', description: '키워드 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '기사 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(ArticlePreviewResponseDto) },
            },
          },
        },
      ],
    },
  })
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

  @ApiOperation({ summary: '키워드별 리뷰 목록 조회 (페이징)' })
  @ApiParam({ name: 'keywordId', description: '키워드 ID', type: Number })
  @ApiQuery({ name: 'page', description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'size', description: '페이지 크기', type: Number })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 (createdAt, updatedAt, likeCounts)',
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '리뷰 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              allOf: [
                { $ref: getSchemaPath(PageResponse) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(PageReviewCountResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
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
  ): Promise<ApiResponse<PageResponse<PageReviewCountResponseDto>>> {
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

  @ApiOperation({ summary: '키워드별 영상 조회' })
  @ApiParam({ name: 'keywordId', description: '키워드 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '영상 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: { $ref: getSchemaPath(VideoResponseDto) },
          },
        },
      ],
    },
  })
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

  @ApiOperation({ summary: '영상 시청 완료 처리' })
  @ApiParam({ name: 'keywordId', description: '키워드 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '영상 시청 완료 처리 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Post(':keywordId/videos')
  async completeVideo(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.videoService.upsertFlag(memberId, keywordId);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
