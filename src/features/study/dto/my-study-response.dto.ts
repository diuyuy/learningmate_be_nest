import { Study } from 'generated/prisma';
import { STUDY_FLAGS } from 'src/common/constants/study-flag';

export class MyStudyResponseDto {
  id: bigint;
  keywordId: bigint;
  studyStats: number;
  studyStatusCount: number;
  videoCompleted: boolean;
  quizCompleted: boolean;
  reviewCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    id,
    keywordId,
    studyStats,
    studyStatusCount,
    videoCompleted,
    quizCompleted,
    reviewCompleted,
    createdAt,
    updatedAt,
  }: MyStudyResponseDto) {
    this.id = id;
    this.keywordId = keywordId;
    this.studyStats = studyStats;
    this.studyStatusCount = studyStatusCount;
    this.videoCompleted = videoCompleted;
    this.quizCompleted = quizCompleted;
    this.reviewCompleted = reviewCompleted;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(
    this: void,
    { id, keywordId, studyStats, createdAt, updatedAt }: Study,
  ): MyStudyResponseDto {
    const value = studyStats ?? 0;

    const bitCount = (value.toString(2).match(/1/g) || []).length;

    return new MyStudyResponseDto({
      id,
      keywordId,
      studyStats: value,
      studyStatusCount: bitCount,
      videoCompleted: (value & STUDY_FLAGS.VIDEO) !== 0,
      quizCompleted: (value & STUDY_FLAGS.QUIZ) !== 0,
      reviewCompleted: (value & STUDY_FLAGS.REVIEW) !== 0,
      createdAt,
      updatedAt,
    });
  }
}
