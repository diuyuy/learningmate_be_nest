import { Keyword } from 'generated/prisma';

export class KeywordResponseDto {
  id: bigint;
  name: string;
  description: string;

  constructor({ id, name, description }: KeywordResponseDto) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static from(keyword: Keyword): KeywordResponseDto {
    return new KeywordResponseDto(keyword);
  }
}
