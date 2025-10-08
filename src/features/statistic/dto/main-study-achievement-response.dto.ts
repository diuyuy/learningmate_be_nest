export class MainStudyAchievementsResponseDto {
  monthlyAttendanceDays: number;
  totalStudiedKeywords: number;
  mostStudiedCategory: string;
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
