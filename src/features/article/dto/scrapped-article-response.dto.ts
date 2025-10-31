import { ApiProperty } from '@nestjs/swagger';
import { ScrappedArticleFromPrismaDto } from '../types/types';

export class ScrappedArticleResponseDto {
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

  @ApiProperty({
    description: '키워드 ID',
    example: {
      id: 1,
      name: '1인당 국민소득',
      description:
        '국민소득을 총국민 수로 나눈 값. 해당 국가의 소득 수준을 보여주는 가장 대표적인 지표이다.',
      date: '2025-10-20 12:33:32.149064',
    },
  })
  keyword: {
    id: bigint;
    name: string;
    description: string;
    date: Date;
  };

  @ApiProperty({ description: '사용자가 스크랩 했는지 여부', type: Boolean })
  scrappedByMe?: boolean;

  constructor({
    id,
    content,
    keyword,
    publishedAt,
    scrapCount,
    summary,
    title,
    views,
    scrappedByMe,
  }: ScrappedArticleResponseDto) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.summary = summary;
    this.publishedAt = publishedAt;
    this.scrapCount = scrapCount;
    this.views = views;
    this.scrappedByMe = scrappedByMe;
    this.keyword = keyword;
  }

  static from(
    this: void,
    {
      keyword: { todaysKeyword, ...keywordRest },
      ...rest
    }: ScrappedArticleFromPrismaDto & { scrappedByMe: boolean },
  ) {
    return new ScrappedArticleResponseDto({
      ...rest,
      keyword: {
        ...keywordRest,
        date: todaysKeyword[0].date,
      },
    });
  }
}
