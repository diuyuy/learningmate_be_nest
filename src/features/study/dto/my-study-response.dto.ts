import { ApiProperty } from '@nestjs/swagger';
import { Study } from 'generated/prisma';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';

export class MyStudyResponseDto {
  @ApiProperty({
    description: '학습 ID',
    example: 1,
    type: 'string',
  })
  id: bigint;

  @ApiProperty({
    description: '키워드 ID',
    example: 1,
    type: 'string',
  })
  keywordId: bigint;

  @ApiProperty({
    description: '학습 상태 비트 플래그',
    example: 7,
    type: 'integer',
  })
  studyStats: number;

  @ApiProperty({
    description: '완료한 학습 항목 개수',
    example: 3,
    type: 'integer',
  })
  studyStatusCount: number;

  @ApiProperty({
    description: '영상 시청 완료 여부',
    example: true,
  })
  videoCompleted: boolean;

  @ApiProperty({
    description: '퀴즈 풀이 완료 여부',
    example: true,
  })
  quizCompleted: boolean;

  @ApiProperty({
    description: '리뷰 작성 완료 여부',
    example: true,
  })
  reviewCompleted: boolean;

  @ApiProperty({
    description: '생성 일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: '2025-01-01T00:00:00.000Z',
  })
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
