import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from '../../article/dto/article-response.dto';
import { Article } from 'generated/prisma/client';

export class MyReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '기사 정보', type: () => ArticleResponseDto })
  article: ArticleResponseDto;

  @ApiProperty({ description: '작성자 ID', type: Number })
  memberId: bigint;

  @ApiProperty({ description: '리뷰 내용' })
  content1: string;

  constructor({ id, article, memberId, content1 }: MyReviewResponseDto) {
    this.id = id;
    this.article = article;
    this.memberId = memberId;
    this.content1 = content1;
  }

  static from(
    review: Omit<MyReviewResponseDto, 'article'> & { Article: Article },
  ): MyReviewResponseDto {
    const { Article: article, ...reviewProps } = review;
    return new MyReviewResponseDto({ article, ...reviewProps });
  }
}
