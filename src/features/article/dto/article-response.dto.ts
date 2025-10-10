import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'generated/prisma';

export class ArticleResponseDto {
  @ApiProperty({ description: '기사 ID', type: String })
  id: bigint;

  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '기사 내용' })
  content: string;

  @ApiProperty({ description: '발행일' })
  publishedAt: Date;

  @ApiProperty({ description: '기사 요약' })
  summary: string;

  @ApiProperty({ description: '스크랩 수', type: String })
  scrapCount: bigint;

  @ApiProperty({ description: '조회수', type: String })
  views: bigint;

  @ApiProperty({ description: '키워드 ID', type: String })
  keywordId: bigint;

  constructor({
    id,
    title,
    content,
    keywordId,
    publishedAt,
    scrapCount,
    summary,
    views,
  }: ArticleResponseDto) {
    this.id = id;
    this.content = content;
    this.keywordId = keywordId;
    this.publishedAt = publishedAt;
    this.scrapCount = scrapCount;
    this.summary = summary;
    this.title = title;
    this.views = views;
  }

  static from(this: void, article: Article): ArticleResponseDto {
    return new ArticleResponseDto(article);
  }
}
