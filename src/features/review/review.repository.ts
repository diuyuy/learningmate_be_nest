import { Injectable } from '@nestjs/common';
import { getHotReviews, upsertStudyFlag } from 'generated/prisma/sql';
import { PageResponse } from 'src/core/api-response/page-response';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { Pageable, ReviewSortOption } from '../../core/types/types';
import {
  PageReviewCountResponseDto,
  PageReviewResponseDto,
  ReviewCreateRequestDto,
} from './dto';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly reviewSelect = {
    id: true,
    article: true,
    content1: true,
    content2: true,
    content3: true,
    memberId: true,
  } as const;

  async create(
    memberId: bigint,
    articleId: bigint,
    data: ReviewCreateRequestDto,
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      const review = await prisma.review.create({
        data: {
          memberId,
          articleId,
          ...data,
        },
        select: this.reviewSelect,
      });

      await prisma.$queryRawTyped(
        upsertStudyFlag(
          memberId,
          review.article.keywordId,
          STUDY_FLAGS.REVIEW,
          STUDY_FLAGS.REVIEW,
        ),
      );

      return review;
    });
  }

  async findByMemberAndArticle(memberId: bigint, articleId: bigint) {
    return this.prismaService.review.findUnique({
      select: this.reviewSelect,
      where: {
        review_member_article: {
          articleId,
          memberId,
        },
      },
    });
  }

  async findById(reviewId: bigint) {
    return this.prismaService.review.findUnique({
      select: {
        id: true,
        memberId: true,
      },
      where: {
        id: reviewId,
      },
    });
  }

  async update(
    reviewId: bigint,
    data: { content1: string; content2: string; content3: string },
  ) {
    return this.prismaService.review.update({
      data,
      select: this.reviewSelect,
      where: {
        id: reviewId,
      },
    });
  }

  async delete(reviewId: bigint) {
    await this.prismaService.review.delete({
      where: {
        id: reviewId,
      },
    });
  }

  async existsByMemberAndArticle(
    memberId: bigint,
    articleId: bigint,
  ): Promise<boolean> {
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

  async findReviewsByMemberId(
    memberId: bigint,
    pageAble: Pageable<ReviewSortOption>,
  ) {
    const reviews = await this.prismaService.review.findMany({
      select: {
        id: true,
        createdAt: true,
        content1: true,
        member: {
          select: {
            nickname: true,
          },
        },
        article: {
          select: {
            title: true,
          },
        },
      },
      where: {
        memberId,
      },
      skip: pageAble.page * pageAble.size,
      take: pageAble.size,
      orderBy: this.orderOption(pageAble),
    });

    const totalElements = await this.prismaService.review.count({
      where: {
        memberId,
      },
    });

    const pageReviews = reviews.map(
      ({ id, createdAt, content1, article, member }) =>
        new PageReviewResponseDto({
          id,
          createdAt,
          content1,
          title: article.title,
          nickname: member.nickname,
        }),
    );

    return PageResponse.from(pageReviews, totalElements, pageAble);
  }

  async findReviewsByKeywordId(
    memberId: bigint,
    keywordId: bigint,
    pageAble: Pageable<ReviewSortOption>,
  ) {
    const reviews = await this.prismaService.review.findMany({
      select: this.selectPageReview(memberId),
      where: {
        article: {
          keywordId,
        },
      },
      skip: pageAble.page * pageAble.size,
      take: pageAble.size,
      orderBy: this.orderOption(pageAble),
    });

    const totalElements = await this.prismaService.review.count({
      where: {
        article: {
          keywordId,
        },
      },
    });

    const pageReviews = reviews.map(PageReviewCountResponseDto.from);

    return PageResponse.from(pageReviews, totalElements, pageAble);
  }

  async findReviewsByArticleId(
    memberId: bigint,
    articleId: bigint,
    pageAble: Pageable<ReviewSortOption>,
  ): Promise<PageResponse<PageReviewCountResponseDto>> {
    const reviews = await this.prismaService.review.findMany({
      select: this.selectPageReview(memberId),
      where: {
        articleId,
      },
      skip: pageAble.page * pageAble.size,
      take: pageAble.size,
      orderBy: this.orderOption(pageAble),
    });

    const totalElements = await this.prismaService.review.count({
      where: {
        articleId,
      },
    });

    const pageReviews = reviews.map(PageReviewCountResponseDto.from);

    return PageResponse.from(pageReviews, totalElements, pageAble);
  }

  async getHotReviews(
    memberId: bigint,
    start: Date,
    end: Date,
    pageSize: number,
    offset: number,
  ) {
    return this.prismaService.$queryRawTyped(
      getHotReviews(memberId, start, end, pageSize, offset),
    );
  }

  async getLikeCount(reviewId: bigint) {
    return this.prismaService.likeReview.count({
      where: {
        reviewId,
      },
    });
  }

  async likeReview(memberId: bigint, reviewId: bigint) {
    console.log('>>>>>');
    await this.prismaService.likeReview.upsert({
      where: {
        reviewId_memberId: {
          memberId,
          reviewId,
        },
      },
      update: {},
      create: {
        reviewId,
        memberId,
      },
    });
  }

  async unlikeReview(memberId: bigint, reviewId: bigint) {
    await this.prismaService.likeReview.deleteMany({
      where: {
        memberId,
        reviewId,
      },
    });
  }

  private orderOption(pageAble: Pageable<ReviewSortOption>) {
    if (pageAble.sortProp === 'likeCounts') {
      return {
        likeReview: {
          _count: pageAble.sortDirection,
        },
      };
    }

    return {
      [pageAble.sortProp]: pageAble.sortDirection,
    };
  }

  private selectPageReview(memberId: bigint) {
    return {
      id: true,
      createdAt: true,
      content1: true,
      article: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          nickname: true,
        },
      },
      _count: {
        select: {
          likeReview: true,
        },
      },
      likeReview: {
        select: {
          memberId: true,
        },
        where: {
          memberId,
        },
      },
    };
  }
}
