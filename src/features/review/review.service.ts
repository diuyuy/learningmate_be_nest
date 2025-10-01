import { Injectable } from '@nestjs/common';
import { PrivateResultType } from 'generated/prisma/runtime/library';
import { getHotReviews } from 'generated/prisma/sql';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
import {
  MyReviewResponseDto,
  PageReviewCountResponseDto,
  ReviewCreateRequestDto,
  ReviewUpdateRequestDto,
} from './dto';
import { GetHotReviewResult, MemberAndReviewId } from './types/types';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    memberId: bigint,
    articleId: bigint,
    reviewCreateRequestDto: ReviewCreateRequestDto,
  ) {
    if (await this.hasWrittenReview(memberId, articleId)) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.DUPLICATE_REVIEW),
      );
    }

    //TODO: Study 에 review 작성했다고 표시 필요

    const newReview = await this.prismaService.review.create({
      data: {
        memberId,
        articleId,
        ...reviewCreateRequestDto,
      },
      select: {
        id: true,
        article: true,
        content1: true,
        content2: true,
        content3: true,
        memberId: true,
      },
    });

    return MyReviewResponseDto.from(newReview);
  }

  async findByMemberAndArticle({
    memberId,
    articleId,
  }: {
    memberId: bigint;
    articleId: bigint;
  }) {
    const review = await this.prismaService.review.findUnique({
      select: {
        id: true,
        article: true,
        content1: true,
        content2: true,
        content3: true,
        memberId: true,
      },
      where: {
        review_member_article: {
          articleId,
          memberId,
        },
      },
    });

    return review ? MyReviewResponseDto.from(review) : null;
  }

  async getLikeReviewCount(reviewId: bigint) {
    const count = await this.prismaService.likeReview.count({
      where: {
        reviewId,
      },
    });

    return count;
  }

  async update({
    memberId,
    reviewId,
    reviewUpdateRequestDto: { content1, content2, content3 },
  }: {
    memberId: bigint;
    reviewId: bigint;
    reviewUpdateRequestDto: ReviewUpdateRequestDto;
  }) {
    await this.validateOwnership({ memberId, reviewId });

    const updatedReview = await this.prismaService.review.update({
      data: {
        content1,
        content2,
        content3,
      },
      select: {
        id: true,
        article: true,
        content1: true,
        content2: true,
        content3: true,
        memberId: true,
      },
      where: {
        id: reviewId,
      },
    });

    return MyReviewResponseDto.from(updatedReview);
  }

  //TODO: 클라이언트와 상의 필요
  async getHotReviews(
    memberId: bigint,
    start: Date,
    end: Date,
    page: number,
    pageSize: number,
  ): Promise<PageReviewCountResponseDto[]> {
    const offset = page * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const queryResult = (await this.prismaService.$queryRawTyped(
      getHotReviews(memberId, start, end, pageSize, offset),
    )) as unknown as GetHotReviewResult[];

    const reviews = queryResult.map((v) => v[PrivateResultType]);

    return reviews.map(({ likedByMe, ...fields }) => {
      return { likedByMe: !!likedByMe, ...fields };
    });
  }

  async remove({ memberId, reviewId }: MemberAndReviewId) {
    await this.validateOwnership({ memberId, reviewId });

    await this.prismaService.review.delete({
      where: {
        id: reviewId,
      },
    });
  }

  async likeReview({
    memberId,
    reviewId,
  }: {
    memberId: bigint;
    reviewId: bigint;
  }) {
    await this.prismaService.likeReview.upsert({
      where: {
        id: reviewId,
      },
      update: {},
      create: {
        reviewId,
        memberId,
      },
    });
  }

  async unlikeReview({ memberId, reviewId }: MemberAndReviewId) {
    await this.prismaService.likeReview.deleteMany({
      where: {
        memberId,
        reviewId,
      },
    });
  }

  private async hasWrittenReview(memberId: bigint, articleId: bigint) {
    const review = await this.prismaService.review.findUnique({
      select: {
        id: true,
      },
      where: {
        review_member_article: {
          memberId,
          articleId,
        },
      },
    });

    return !!review;
  }

  private async validateOwnership({
    memberId,
    reviewId,
  }: {
    memberId: bigint;
    reviewId: bigint;
  }) {
    const review = await this.prismaService.review.findUnique({
      select: {
        memberId: true,
      },
      where: {
        id: reviewId,
      },
    });

    if (!review)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.REVIEW_NOT_FOUND),
      );

    if (memberId !== review.memberId) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.FORBIDDEN),
      );
    }
  }
}
