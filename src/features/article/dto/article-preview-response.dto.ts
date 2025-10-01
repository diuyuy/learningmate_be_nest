import { Article } from 'generated/prisma';

export class ArticlePreviewResponseDto {
  id: bigint;
  title: string;
  content: string;
  publishedAt: Date;
  press: string;

  constructor({
    id,
    title,
    content,
    publishedAt,
    press,
  }: ArticlePreviewResponseDto) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.publishedAt = publishedAt;
    this.press = press;
  }

  static from = (article: Article) => {
    return new ArticlePreviewResponseDto(article);
  };
}
