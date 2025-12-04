import { ApiProperty } from '@nestjs/swagger';
import { ReviewFromPrisma } from '../types/types';

export class PageMyReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '기사 ID', type: Number })
  articleId: bigint;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '리뷰 내용' })
  content1: string;

  @ApiProperty({ description: '작성자 닉네임', nullable: true, example: null })
  nickname: string | null;

  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '좋아요 수', type: Number })
  likeCount: bigint;

  constructor({
    id,
    articleId,
    createdAt,
    content1,
    nickname,
    title,
    likeCount,
  }: PageMyReviewResponseDto) {
    this.id = id;
    this.articleId = articleId;
    this.createdAt = createdAt;
    this.content1 = content1;
    this.nickname = nickname;
    this.title = title;
    this.likeCount = likeCount;
  }

  static from(this: void, review: Omit<ReviewFromPrisma, 'likeReview'>) {
    const { Member: member, Article: article, _count, ...rest } = review;
    return new PageMyReviewResponseDto({
      ...rest,
      nickname: member.nickname,
      articleId: article.id,
      title: article.title,
      likeCount: BigInt(_count.LikeReview),
    });
  }
}
