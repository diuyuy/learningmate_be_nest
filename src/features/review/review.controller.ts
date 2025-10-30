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
import {
  ApiBody,
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
import { PageReviewCountResponseDto, ReviewUpdateRequestDto } from './dto';
import { PageMyReviewResponseDto } from './dto/page-my-review-response.dto';
import { ReviewService } from './review.service';

@ApiTags('Review')
@ApiExtraModels(PageMyReviewResponseDto)
@Controller('v1/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({
    summary: '리뷰 좋아요',
    description: '특정 리뷰에 좋아요를 추가합니다.',
  })
  @ApiParam({
    name: 'reviewId',
    description: '좋아요를 추가할 리뷰 ID',
    type: Number,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '좋아요 추가 성공',
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
  @Post(':reviewId/likes')
  async likeReview(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.likeReview({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @ApiOperation({
    summary: '내 리뷰 조회',
    description: '로그인한 사용자의 리뷰 목록을 페이지네이션하여 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (0부터 시작)',
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'size',
    description: '페이지 크기',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 (createdAt, updatedAt, likeCounts)',
    type: String,
    example: 'createdAt,desc',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '내 리뷰 조회 성공',
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
                        $ref: getSchemaPath(PageMyReviewResponseDto),
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

  @ApiOperation({
    summary: '인기 리뷰 조회',
    description: '특정 날짜의 인기 리뷰 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD 형식)',
    type: String,
    example: '2025-01-01',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '인기 리뷰 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(PageReviewCountResponseDto) },
            },
          },
        },
      ],
    },
  })
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

  @ApiOperation({
    summary: '리뷰 수정',
    description: '특정 리뷰의 내용을 수정합니다.',
  })
  @ApiParam({
    name: 'reviewId',
    description: '수정할 리뷰 ID',
    type: Number,
  })
  @ApiBody({ type: ReviewUpdateRequestDto })
  @ApiResponseDecorator({
    status: 200,
    description: '리뷰 수정 성공',
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

  @ApiOperation({
    summary: '리뷰 삭제',
    description: '특정 리뷰를 삭제합니다.',
  })
  @ApiParam({
    name: 'reviewId',
    description: '삭제할 리뷰 ID',
    type: Number,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '리뷰 삭제 성공',
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
  @Delete(':reviewId')
  async remove(
    @Param('reviewId', ParseBigIntPipe) reviewId: bigint,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    await this.reviewService.remove({ memberId, reviewId });

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @ApiOperation({
    summary: '리뷰 좋아요 취소',
    description: '특정 리뷰의 좋아요를 취소합니다.',
  })
  @ApiParam({
    name: 'reviewId',
    description: '좋아요를 취소할 리뷰 ID',
    type: Number,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '좋아요 취소 성공',
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
