import { ApiProperty } from '@nestjs/swagger';

export class PageReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: String })
  id: bigint;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '리뷰 내용' })
  content1: string;

  @ApiProperty({ description: '작성자 닉네임', nullable: true })
  nickname: string | null;

  @ApiProperty({ description: '제목' })
  title: string;

  constructor({
    id,
    createdAt,
    content1,
    nickname,
    title,
  }: PageReviewResponseDto) {
    this.id = id;
    this.createdAt = createdAt;
    this.content1 = content1;
    this.nickname = nickname;
    this.title = title;
  }
}
