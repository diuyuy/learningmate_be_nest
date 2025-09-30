export class PageReviewCountResponseDto {
  id: bigint;
  articleId: bigint;
  memberId: bigint;
  createdAt: Date;
  content1: string;
  nickname: string;
  title: string;
  likeCount: bigint;
  likedByMe: boolean;

  constructor({
    id,
    articleId,
    memberId,
    createdAt,
    content1,
    nickname,
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
    this.title = title;
    this.likeCount = likeCount;
    this.likedByMe = likedByMe;
  }
}
