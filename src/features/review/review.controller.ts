import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseDatePipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
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
import type { ReviewUpdateRequestDto } from './dto';
import { ReviewService } from './review.service';

@Controller('v1/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':reviewId/likes')
  async likeReview(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.likeReview({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Get('me')
  async findMyReviews(
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

    const pageReviews = await this.reviewService.findByMemberId(
      memberId,
      pageAble,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      pageReviews,
    );
  }

  @Get('hot-reviews')
  async findHotReviews(
    @Query('date', new ParseDatePipe()) date: Date,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    const hotReviews = await this.reviewService.getHotReviews(memberId, date);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      hotReviews,
    );
  }

  @Patch(':reviewId')
  async updateReview(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
    @Body() reviewUpdateRequestDto: ReviewUpdateRequestDto,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.update({
      memberId,
      reviewId,
      reviewUpdateRequestDto,
    });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Delete(':reviewId')
  async remove(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.remove({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Delete(':reviewId/likes')
  async unlikeReview(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.unlikeReview({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
