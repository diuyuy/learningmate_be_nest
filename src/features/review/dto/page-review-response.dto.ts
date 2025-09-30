export class PageReviewResponseDto {
  id: bigint;
  createdAt: Date;
  content1: string;
  nickname: string;
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
