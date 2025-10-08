import { getStudyCategoryStatistics } from 'generated/prisma/sql';
import { CATEGORY_NAME_MAP } from 'src/core/constants/category-name-map';

export class StudyCatStatsResponseDto {
  finance: number;
  economy: number;
  management: number;
  pub: number;
  science: number;
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
