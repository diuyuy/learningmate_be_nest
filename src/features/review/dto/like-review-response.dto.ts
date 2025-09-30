export class LikeReviewResponseDto {
  id: bigint;
  reviewCount: bigint;

  static from(reviewId: bigint, reviewCount: bigint): LikeReviewResponseDto {
    const dto = new LikeReviewResponseDto();
    dto.id = reviewId;
    dto.reviewCount = reviewCount;
    return dto;
  }
}
