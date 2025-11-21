export type MemberAndReviewId = {
  memberId: bigint;
  reviewId: bigint;
};

// export type GetHotReviewResult = Awaited<ReturnType<typeof getHotReviews>>;

export type ReviewFromPrisma = {
  id: bigint;
  createdAt: Date;
  content1: string;
  Member: {
    id: bigint;
    nickname: string | null;
    imageUrl: string | null;
  };
  Article: {
    id: bigint;
    title: string;
  };
  LikeReview: {
    memberId: bigint;
  }[];
  _count: {
    LikeReview: number;
  };
};
