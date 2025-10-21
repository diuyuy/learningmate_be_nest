import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from 'generated/prisma';

export class KeywordResponseDto {
  @ApiProperty({ description: '키워드 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '키워드 이름' })
  name: string;

  @ApiProperty({ description: '키워드 설명' })
  description: string;

  constructor({ id, name, description }: KeywordResponseDto) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static from(this: void, keyword: Keyword): KeywordResponseDto {
    return new KeywordResponseDto(keyword);
  }
}
