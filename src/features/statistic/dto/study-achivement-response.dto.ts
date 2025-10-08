export class StudyAchivementResponseDto {
  studyCounts: number;
  reviewCounts: number;
  solvedQuizCounts: number;
  watchedVideoCounts: number;

  constructor({
    studyCounts,
    reviewCounts,
    solvedQuizCounts,
    watchedVideoCounts,
  }: StudyAchivementResponseDto) {
    this.studyCounts = studyCounts;
    this.reviewCounts = reviewCounts;
    this.solvedQuizCounts = solvedQuizCounts;
    this.watchedVideoCounts = watchedVideoCounts;
  }

  static from(studyAchivement: StudyAchivementResponseDto) {
    return new StudyAchivementResponseDto(studyAchivement);
  }
}
