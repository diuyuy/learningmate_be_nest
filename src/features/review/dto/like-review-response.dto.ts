import { ApiProperty } from '@nestjs/swagger';

export class LikeReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: String })
  id: bigint;

  @ApiProperty({ description: '리뷰 좋아요 수', type: String })
  reviewCount: bigint;

  static from(reviewId: bigint, reviewCount: bigint): LikeReviewResponseDto {
    const dto = new LikeReviewResponseDto();
    dto.id = reviewId;
    dto.reviewCount = reviewCount;
    return dto;
  }
}
