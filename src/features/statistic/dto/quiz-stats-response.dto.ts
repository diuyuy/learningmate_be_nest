export class QuizStatsResponseDto {
  correctCounts: number;
  totalCounts: number;

  constructor({ correctCounts, totalCounts }: QuizStatsResponseDto) {
    this.correctCounts = correctCounts;
    this.totalCounts = totalCounts;
  }

  static from(quizStats: QuizStatsResponseDto) {
    return new QuizStatsResponseDto(quizStats);
  }
}
