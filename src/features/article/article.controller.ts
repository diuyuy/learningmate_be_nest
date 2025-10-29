import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import type { RequestWithUser } from '../auth/types/request-with-user';
import { MemberQuizRequestDto } from '../quiz/dto/member-quiz-request.dto';
import { QuizResponseDto } from '../quiz/dto/quiz-response.dto';
import { QuizService } from '../quiz/quiz.service';
import type { ReviewCreateRequestDto } from '../review/dto';
import { MyReviewResponseDto } from '../review/dto/my-review-response.dto';
import { PageReviewCountResponseDto } from '../review/dto/page-review-count-response.dto';
import { PageReviewResponseDto } from '../review/dto/page-review-response.dto';
import { ReviewService } from '../review/review.service';
import { ArticleService } from './article.service';
import { ArticleResponseDto } from './dto/article-response.dto';

@ApiTags('Article')
@ApiExtraModels(
  ApiResponse,
  PageResponse,
  ArticleResponseDto,
  QuizResponseDto,
  PageReviewResponseDto,
  PageReviewCountResponseDto,
  MyReviewResponseDto,
)
@Controller('v1/articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly quizService: QuizService,
    private readonly reviewService: ReviewService,
  ) {}

  @ApiOperation({ summary: '기사 상세 조회' })
  @ApiParam({ name: 'id', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '기사 상세 정보 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: { $ref: getSchemaPath(ArticleResponseDto) },
          },
        },
      ],
    },
  })
  @Get(':id')
  async findById(@Param('id', ParseBigIntPipe) id: bigint) {
    const article = await this.articleService.findById(id);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      article,
    );
  }

  @ApiOperation({ summary: '기사의 퀴즈 목록 조회' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '퀴즈 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(QuizResponseDto) },
            },
          },
        },
      ],
    },
  })
  @Get(':articleId/quizzes')
  async findQuizzes(@Param('articleId', ParseBigIntPipe) articleId: bigint) {
    const quizzes = await this.quizService.findManyByArticleId(articleId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quizzes,
    );
  }

  @ApiOperation({ summary: '기사의 리뷰 목록 조회 (페이징)' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
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
  @Get(':articleId/reviews')
  async findReviewsInArticle(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
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

    const result = await this.reviewService.findReviewsByArticle({
      memberId,
      articleId,
      pageAble,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      result,
    );
  }

  @ApiOperation({ summary: '내 리뷰 조회' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '내 리뷰 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: { $ref: getSchemaPath(MyReviewResponseDto) },
          },
        },
      ],
    },
  })
  @Get(':articleId/reviews/me')
  async findMyReviewByArticleId(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    const myReview = await this.reviewService.findByMemberAndArticle({
      memberId,
      articleId,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      myReview,
    );
  }

  @ApiOperation({ summary: '리뷰 생성' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 201,
    description: '리뷰 생성 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: { $ref: getSchemaPath(MyReviewResponseDto) },
          },
        },
      ],
    },
  })
  @Post(':articleId/reviews')
  async createReview(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Req() req: RequestWithUser,
    @Body() reviewCreateRequestDto: ReviewCreateRequestDto,
  ) {
    const memberId = BigInt(req.user.id);

    const review = await this.reviewService.create(
      memberId,
      articleId,
      reviewCreateRequestDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.REVIEW_CREATED),
      review,
    );
  }

  @ApiOperation({ summary: '퀴즈 풀기' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiParam({ name: 'quizId', description: '퀴즈 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '퀴즈 풀이 완료',
    schema: {
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Post(':articleId/quizzes/:quizId')
  async solveQuiz(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Param('quizId', ParseBigIntPipe) quizId: bigint,
    @Req() req: RequestWithUser,
    @Body() memberQuizRequest: MemberQuizRequestDto,
  ) {
    const memberId = BigInt(req.user.id);

    const quizResponse = await this.quizService.solveQuiz({
      memberId,
      articleId,
      quizId,
      memberQuizRequest,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      quizResponse,
    );
  }

  @ApiOperation({ summary: '기사 스크랩' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 201,
    description: '기사 스크랩 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.CREATED).message,
        },
      },
    },
  })
  @Post(':articleId/article-scraps')
  async scrapArticle(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.articleService.scrapArticle(memberId, articleId);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.CREATED));
  }

  @ApiOperation({ summary: '기사 스크랩 취소' })
  @ApiParam({ name: 'articleId', description: '기사 ID', type: Number })
  @ApiResponseDecorator({
    status: 200,
    description: '기사 스크랩 취소 성공',
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
  @Delete(':articleId/article-scraps')
  async cancelScrap(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.articleService.cancleScrap(memberId, articleId);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
