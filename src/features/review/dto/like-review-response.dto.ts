import { ApiProperty } from '@nestjs/swagger';

export class LikeReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '리뷰 좋아요 수', type: Number })
  reviewCount: bigint;

  static from(reviewId: bigint, reviewCount: bigint): LikeReviewResponseDto {
    const dto = new LikeReviewResponseDto();
    dto.id = reviewId;
    dto.reviewCount = reviewCount;
    return dto;
  }
}
