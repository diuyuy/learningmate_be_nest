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
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint-pipe';
import type { RequestWithUser } from '../auth/types/request-with-user';
import type { ReviewUpdateRequestDto } from './dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':reviewId/likes')
  async likeReview(
    @Param('reviewid', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.likeReview({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Get('hot-reviews')
  async findHotReviews(
    @Query('date', ParseDatePipe) date: Date,
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
