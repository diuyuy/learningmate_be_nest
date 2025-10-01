import { getHotReviews } from 'generated/prisma/sql';

export type MemberAndReviewId = {
  memberId: bigint;
  reviewId: bigint;
};

export type GetHotReviewResult = Awaited<ReturnType<typeof getHotReviews>>;
