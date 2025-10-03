import { getHotReviews } from 'generated/prisma/sql';

export type MemberAndReviewId = {
  memberId: bigint;
  reviewId: bigint;
};

export type GetHotReviewResult = Awaited<ReturnType<typeof getHotReviews>>;

export type ReviewFromPrisma = {
  id: bigint;
  createdAt: Date;
  content1: string;
  member: {
    id: bigint;
    nickname: string | null;
  };
  article: {
    id: bigint;
    title: string;
  };
  likeReview: {
    memberId: bigint;
  }[];
  _count: {
    likeReview: number;
  };
};
