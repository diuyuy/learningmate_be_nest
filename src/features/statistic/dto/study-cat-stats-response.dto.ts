import { ApiProperty } from '@nestjs/swagger';
import { getStudyCategoryStatistics } from 'generated/prisma/sql';
import { CATEGORY_NAME_MAP } from 'src/core/constants/category-name-map';

export class StudyCatStatsResponseDto {
  @ApiProperty({
    description: '금융 카테고리 학습 횟수',
    example: 5,
    type: 'integer',
  })
  finance: number;

  @ApiProperty({
    description: '경제 카테고리 학습 횟수',
    example: 10,
    type: 'integer',
  })
  economy: number;

  @ApiProperty({
    description: '경영 카테고리 학습 횟수',
    example: 3,
    type: 'integer',
  })
  management: number;

  @ApiProperty({
    description: '공공 카테고리 학습 횟수',
    example: 7,
    type: 'integer',
  })
  pub: number;

  @ApiProperty({
    description: '과학 카테고리 학습 횟수',
    example: 2,
    type: 'integer',
  })
  science: number;

  @ApiProperty({
    description: '사회 카테고리 학습 횟수',
    example: 8,
    type: 'integer',
  })
  society: number;

  constructor({
    finance,
    economy,
    management,
    pub,
    science,
    society,
  }: Partial<StudyCatStatsResponseDto>) {
    this.finance = finance ?? 0;
    this.economy = economy ?? 0;
    this.management = management ?? 0;
    this.science = science ?? 0;
    this.pub = pub ?? 0;
    this.society = society ?? 0;
  }

  static from(result: getStudyCategoryStatistics.Result[]) {
    const studyCatStats: Partial<StudyCatStatsResponseDto> = {};
    result.forEach((v) => {
      if (v.name) {
        studyCatStats[
          CATEGORY_NAME_MAP[v.name as keyof typeof CATEGORY_NAME_MAP]
        ] = Number(v.totalCounts);
      }
    });

    return new StudyCatStatsResponseDto(studyCatStats);
  }
}
