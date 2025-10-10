import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from '../../article/dto/article-response.dto';

export class MyReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: String })
  id: bigint;

  @ApiProperty({ description: '기사 정보', type: () => ArticleResponseDto })
  article: ArticleResponseDto;

  @ApiProperty({ description: '작성자 ID', type: String })
  memberId: bigint;

  @ApiProperty({ description: '리뷰 내용 1' })
  content1: string;

  @ApiProperty({ description: '리뷰 내용 2' })
  content2: string;

  @ApiProperty({ description: '리뷰 내용 3' })
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
