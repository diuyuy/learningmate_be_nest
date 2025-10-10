import { ApiProperty } from '@nestjs/swagger';

export class QuizStatsResponseDto {
  @ApiProperty({
    description: '정답 개수',
    example: 8,
    type: 'integer',
  })
  correctCounts: number;

  @ApiProperty({
    description: '총 퀴즈 개수',
    example: 10,
    type: 'integer',
  })
  totalCounts: number;

  constructor({ correctCounts, totalCounts }: QuizStatsResponseDto) {
    this.correctCounts = correctCounts;
    this.totalCounts = totalCounts;
  }

  static from(quizStats: QuizStatsResponseDto) {
    return new QuizStatsResponseDto(quizStats);
  }
}
