import { ApiProperty } from '@nestjs/swagger';
import { ReviewFromPrisma } from '../types/types';

export class PageReviewCountResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '기사 ID', type: Number })
  articleId: bigint;

  @ApiProperty({ description: '작성자 ID', type: Number })
  memberId: bigint;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '리뷰 내용' })
  content1: string;

  @ApiProperty({ description: '작성자 닉네임', nullable: true, example: null })
  nickname: string | null;

  @ApiProperty({
    description: '작성자 프로필 이미지',
    nullable: true,
    example: null,
  })
  imageUrl: string | null;

  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '좋아요 수', type: Number })
  likeCount: bigint;

  @ApiProperty({ description: '내가 좋아요를 눌렀는지 여부' })
  likedByMe: boolean;

  constructor({
    id,
    articleId,
    memberId,
    createdAt,
    content1,
    nickname,
    imageUrl,
    title,
    likeCount,
    likedByMe,
  }: PageReviewCountResponseDto) {
    this.id = id;
    this.articleId = articleId;
    this.memberId = memberId;
    this.createdAt = createdAt;
    this.content1 = content1;
    this.nickname = nickname;
    this.imageUrl = imageUrl;
    this.title = title;
    this.likeCount = likeCount;
    this.likedByMe = likedByMe;
  }

  static from(this: void, review: ReviewFromPrisma) {
    const {
      Member: member,
      Article: article,
      _count,
      LikeReview: likeReview,
      ...rest
    } = review;
    return new PageReviewCountResponseDto({
      ...rest,
      memberId: member.id,
      nickname: member.nickname,
      imageUrl: member.imageUrl,
      articleId: article.id,
      title: article.title,
      likeCount: BigInt(_count.LikeReview),
      likedByMe: !!likeReview.length,
    });
  }
}
