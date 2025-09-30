import { Article } from 'generated/prisma';

export class ArticleResponseDto {
  id: bigint;
  title: string;
  content: string;
  link: string;
  press: string;
  reporter: string;
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
    link,
    press,
    publishedAt,
    reporter,
    scrapCount,
    summary,
    views,
  }: ArticleResponseDto) {
    this.id = id;
    this.content = content;
    this.keywordId = keywordId;
    this.link = link;
    this.press = press;
    this.publishedAt = publishedAt;
    this.reporter = reporter;
    this.scrapCount = scrapCount;
    this.summary = summary;
    this.title = title;
    this.views = views;
  }

  static from(article: Article): ArticleResponseDto {
    return new ArticleResponseDto(article);
  }
}
