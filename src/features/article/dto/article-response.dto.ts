import { Article } from 'generated/prisma';

export class ArticleResponseDto {
  id: bigint;
  title: string;
  content: string;
  publishedAt: Date;
  summary: string;
  scrapCount: bigint;
  views: bigint;
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
