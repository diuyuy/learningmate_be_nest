import { ApiProperty } from '@nestjs/swagger';

export class StudyAchivementResponseDto {
  @ApiProperty({
    description: '총 학습 횟수',
    example: 50,
    type: 'integer',
  })
  studyCounts: number;

  @ApiProperty({
    description: '총 리뷰 작성 횟수',
    example: 30,
    type: 'integer',
  })
  reviewCounts: number;

  @ApiProperty({
    description: '총 퀴즈 풀이 횟수',
    example: 45,
    type: 'integer',
  })
  solvedQuizCounts: number;

  @ApiProperty({
    description: '총 영상 시청 횟수',
    example: 40,
    type: 'integer',
  })
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
