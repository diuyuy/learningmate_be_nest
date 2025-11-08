import { ApiProperty } from '@nestjs/swagger';

export class ArticleDetailResponseDto {
  @ApiProperty({ description: '기사 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '기사 제목' })
  title: string;

  @ApiProperty({ description: '기사 내용' })
  content: string;

  @ApiProperty({ description: '발행일' })
  publishedAt: Date;

  @ApiProperty({ description: '기사 요약' })
  summary: string;

  @ApiProperty({ description: '스크랩 수', type: Number })
  scrapCount: bigint;

  @ApiProperty({ description: '조회수', type: Number })
  views: bigint;

  @ApiProperty({ description: '키워드 ID', type: Number })
  keyword: { id: bigint; name: string };

  @ApiProperty({ description: '사용자가 스크랩 했는지 여부', type: Boolean })
  scrappedByMe?: boolean;

  constructor({
    id,
    title,
    content,
    keyword,
    publishedAt,
    scrapCount,
    summary,
    views,
    scrappedByMe,
  }: ArticleDetailResponseDto) {
    this.id = id;
    this.content = content;
    this.keyword = keyword;
    this.publishedAt = publishedAt;
    this.scrapCount = scrapCount;
    this.summary = summary;
    this.title = title;
    this.views = views;
    this.scrappedByMe = scrappedByMe;
  }

  static from(
    this: void,
    article: ArticleDetailResponseDto,
  ): ArticleDetailResponseDto {
    return new ArticleDetailResponseDto(article);
  }
}
