import { ApiProperty } from '@nestjs/swagger';
import { Keyword, TodaysKeyword } from 'generated/prisma';
import { KeywordResponseDto } from './keyword-response.dto';

export class TodaysKeywordResponseDto {
  @ApiProperty({ description: '오늘의 키워드 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '키워드 정보', type: () => KeywordResponseDto })
  keyword: KeywordResponseDto;

  @ApiProperty({ description: '날짜' })
  date: Date;

  constructor({ id, keyword, date }: TodaysKeywordResponseDto) {
    this.id = id;
    this.keyword = keyword;
    this.date = date;
  }

  static from(
    this: void,
    todaysKeyword: TodaysKeyword & { keyword: Keyword },
  ): TodaysKeywordResponseDto {
    return new TodaysKeywordResponseDto({
      id: todaysKeyword.id,
      keyword: KeywordResponseDto.from(todaysKeyword.keyword),
      date: todaysKeyword.date,
    });
  }
}
