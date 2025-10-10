import { ApiProperty } from '@nestjs/swagger';

export class MainStudyAchievementsResponseDto {
  @ApiProperty({
    description: '이번 달 출석 일수',
    example: 15,
    type: 'integer',
  })
  monthlyAttendanceDays: number;

  @ApiProperty({
    description: '총 학습한 키워드 개수',
    example: 42,
    type: 'integer',
  })
  totalStudiedKeywords: number;

  @ApiProperty({
    description: '가장 많이 학습한 카테고리',
    example: '경제',
  })
  mostStudiedCategory: string;

  @ApiProperty({
    description: '총 작성한 리뷰 개수',
    example: 28,
    type: 'integer',
  })
  totalReviews: number;

  constructor({
    monthlyAttendanceDays,
    totalStudiedKeywords,
    mostStudiedCategory,
    totalReviews,
  }: MainStudyAchievementsResponseDto) {
    this.monthlyAttendanceDays = monthlyAttendanceDays;
    this.totalStudiedKeywords = totalStudiedKeywords;
    this.mostStudiedCategory = mostStudiedCategory;
    this.totalReviews = totalReviews;
  }
}
