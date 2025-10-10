import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'generated/prisma';

export class ArticlePreviewResponseDto {
  @ApiProperty({ description: '기사 ID', type: String })
  id: bigint;

  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '기사 내용' })
  content: string;

  @ApiProperty({ description: '발행일' })
  publishedAt: Date;

  constructor({ id, title, content, publishedAt }: ArticlePreviewResponseDto) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.publishedAt = publishedAt;
  }

  static from(this: void, article: Article) {
    return new ArticlePreviewResponseDto(article);
  }
}
