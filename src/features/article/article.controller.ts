import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiResponse } from 'src/core/api-response/api-response';
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
import { QuizService } from '../quiz/quiz.service';
import type { ReviewCreateRequestDto } from '../review/dto';
import { ReviewService } from '../review/review.service';
import { ArticleService } from './article.service';

@Controller('v1/articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly quizService: QuizService,
    private readonly reviewService: ReviewService,
  ) {}

  @Get(':id')
  async findById(@Param('id', ParseBigIntPipe) id: bigint) {
    const article = await this.articleService.findById(id);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      article,
    );
  }

  @Get(':articleId/quizzes')
  async findQuizzes(@Param('articleId', ParseBigIntPipe) articleId: bigint) {
    const quizzes = await this.quizService.findManyByArticleId(articleId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quizzes,
    );
  }

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
  ) {
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

  @Post(':articleId/quizzes/:quizId')
  async solveQuiz(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Param('quizId', ParseBigIntPipe) quizId: bigint,
    @Req() req: RequestWithUser,
    @Body() memberQuizRequest: MemberQuizRequestDto,
  ) {
    const memberId = BigInt(req.user.id);

    await this.quizService.solveQuiz({
      memberId,
      articleId,
      quizId,
      memberQuizRequest,
    });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
