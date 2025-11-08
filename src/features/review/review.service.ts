import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { Pageable, ReviewSortOption } from 'src/core/types/types';
import {
  MyReviewResponseDto,
  PageReviewCountResponseDto,
  ReviewCreateRequestDto,
  ReviewUpdateRequestDto,
} from './dto';
import { ReviewRepository } from './review.repository';
import { MemberAndReviewId } from './types/types';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

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

    const newReview = await this.reviewRepository.create(
      memberId,
      articleId,
      reviewCreateRequestDto,
    );

    return MyReviewResponseDto.from(newReview);
  }

  async findByMemberId(memberId: bigint, pageAble: Pageable<ReviewSortOption>) {
    return this.reviewRepository.findReviewsByMemberId(memberId, pageAble);
  }

  async findByMemberAndArticle({
    memberId,
    articleId,
  }: {
    memberId: bigint;
    articleId: bigint;
  }) {
    const review = await this.reviewRepository.findByMemberAndArticle(
      memberId,
      articleId,
    );

    return review ? MyReviewResponseDto.from(review) : null;
  }

  async getLikeReviewCount(reviewId: bigint) {
    return this.reviewRepository.getLikeCount(reviewId);
  }

  async update({
    memberId,
    reviewId,
    reviewUpdateRequestDto: { content1 },
  }: {
    memberId: bigint;
    reviewId: bigint;
    reviewUpdateRequestDto: ReviewUpdateRequestDto;
  }) {
    await this.validateOwnership({ memberId, reviewId });

    const updatedReview = await this.reviewRepository.update(reviewId, {
      content1,
    });

    return MyReviewResponseDto.from(updatedReview);
  }

  async findReviewsByArticle({
    memberId,
    articleId,
    pageAble,
  }: {
    memberId: bigint;
    articleId: bigint;
    pageAble: Pageable<ReviewSortOption>;
  }) {
    return this.reviewRepository.findReviewsByArticleId(
      memberId,
      articleId,
      pageAble,
    );
  }

  async findReviewsByKeyword({
    memberId,
    keywordId,
    pageAble,
  }: {
    memberId: bigint;
    keywordId: bigint;
    pageAble: Pageable<ReviewSortOption>;
  }) {
    return this.reviewRepository.findReviewsByKeywordId(
      memberId,
      keywordId,
      pageAble,
    );
  }

  async getHotReviews(
    memberId: bigint,
    date: Date,
  ): Promise<PageReviewCountResponseDto[]> {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(date.getDate() + 1);
    const page = 0;
    const pageSize = 5;

    const offset = page * pageSize;

    const reviews = await this.reviewRepository.getHotReviews(
      memberId,
      start,
      end,
      pageSize,
      offset,
    );

    return reviews.map(({ likedByMe, ...fields }) => {
      return { likedByMe: !!likedByMe, ...fields };
    });
  }

  async remove({ memberId, reviewId }: MemberAndReviewId) {
    await this.validateOwnership({ memberId, reviewId });

    await this.reviewRepository.delete(reviewId);
  }

  async likeReview({
    memberId,
    reviewId,
  }: {
    memberId: bigint;
    reviewId: bigint;
  }) {
    await this.reviewRepository.likeReview(memberId, reviewId);
  }

  async unlikeReview({ memberId, reviewId }: MemberAndReviewId) {
    await this.reviewRepository.unlikeReview(memberId, reviewId);
  }

  private async hasWrittenReview(memberId: bigint, articleId: bigint) {
    return this.reviewRepository.existsByMemberAndArticle(memberId, articleId);
  }

  private async validateOwnership({
    memberId,
    reviewId,
  }: {
    memberId: bigint;
    reviewId: bigint;
  }) {
    const review = await this.reviewRepository.findById(reviewId);

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
