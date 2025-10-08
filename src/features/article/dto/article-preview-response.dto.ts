import { Article } from 'generated/prisma';

export class ArticlePreviewResponseDto {
  id: bigint;
  title: string;
  content: string;
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
