import { ArticleResponseDto } from '../../article/dto/article-response.dto';

export class MyReviewResponseDto {
  id: bigint;
  article: ArticleResponseDto;
  memberId: bigint;
  content1: string;
  content2: string;
  content3: string;

  constructor({
    id,
    article,
    memberId,
    content1,
    content2,
    content3,
  }: MyReviewResponseDto) {
    this.id = id;
    this.article = article;
    this.memberId = memberId;
    this.content1 = content1;
    this.content2 = content2;
    this.content3 = content3;
  }

  static from(review: MyReviewResponseDto): MyReviewResponseDto {
    return new MyReviewResponseDto(review);
  }
}
