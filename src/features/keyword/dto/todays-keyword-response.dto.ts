import { Keyword, TodaysKeyword } from 'generated/prisma';
import { KeywordResponseDto } from './keyword-response.dto';

export class TodaysKeywordResponseDto {
  id: bigint;
  keyword: KeywordResponseDto;
  date: Date;

  constructor({ id, keyword, date }: TodaysKeywordResponseDto) {
    this.id = id;
    this.keyword = keyword;
    this.date = date;
  }

  static from(
    todaysKeyword: TodaysKeyword & { keyword: Keyword },
  ): TodaysKeywordResponseDto {
    return new TodaysKeywordResponseDto({
      id: todaysKeyword.id,
      keyword: KeywordResponseDto.from(todaysKeyword.keyword),
      date: todaysKeyword.date,
    });
  }
}
