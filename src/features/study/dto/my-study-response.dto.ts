import { Study } from 'generated/prisma';

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

    // Bit flags for study completion status
    const VIDEO_BIT = 1; // 0001
    const QUIZ_BIT = 2; // 0010
    const REVIEW_BIT = 4; // 0100

    const bitCount = (value.toString(2).match(/1/g) || []).length;

    return new MyStudyResponseDto({
      id,
      keywordId,
      studyStats: value,
      studyStatusCount: bitCount,
      videoCompleted: (value & VIDEO_BIT) !== 0,
      quizCompleted: (value & QUIZ_BIT) !== 0,
      reviewCompleted: (value & REVIEW_BIT) !== 0,
      createdAt,
      updatedAt,
    });
  }
}
