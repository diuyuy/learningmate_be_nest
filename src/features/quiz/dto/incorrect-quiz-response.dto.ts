import { ApiProperty } from '@nestjs/swagger';

export type IncorrectQuizQueryResult = {
  id: bigint;
  description: string;
  explanation: string;
  answer: string;
  memberAnswer: string;
  answerCreatedAt: Date;
  articleId: bigint;
  title: string;
};

export class IncorrectQuizResponseDto {
  @ApiProperty({ description: '퀴즈 ID', example: 1 })
  id: bigint;

  @ApiProperty({
    description: '관련 기사 정보',
    example: { id: 1, title: '경제 뉴스 제목' },
  })
  article: {
    id: bigint;
    title: string;
  };

  @ApiProperty({ description: '퀴즈 문제', example: '이 경제 용어의 의미는?' })
  description: string;

  @ApiProperty({
    description: '퀴즈 해설',
    example: '이 용어는 경제학에서 중요한 개념입니다.',
  })
  explanation: string;

  @ApiProperty({ description: '정답', example: '인플레이션' })
  answer: string;

  @ApiProperty({ description: '사용자가 제출한 오답', example: '디플레이션' })
  memberAnswer: string;

  @ApiProperty({
    description: '오답 제출 시각',
    example: '2025-01-15T10:30:00Z',
  })
  answerCreatedAt: Date;

  constructor({
    id,
    article,
    description,
    explanation,
    answer,
    memberAnswer,
    answerCreatedAt,
  }: IncorrectQuizResponseDto) {
    this.id = id;
    this.article = article;
    this.description = description;
    this.explanation = explanation;
    this.answer = answer;
    this.memberAnswer = memberAnswer;
    this.answerCreatedAt = answerCreatedAt;
  }

  static from(
    this: void,
    {
      id,
      description,
      explanation,
      answer,
      memberAnswer,
      articleId,
      title,
      answerCreatedAt,
    }: IncorrectQuizQueryResult,
  ) {
    return new IncorrectQuizResponseDto({
      id,
      description,
      explanation,
      answer,
      memberAnswer,
      answerCreatedAt,
      article: {
        id: articleId,
        title,
      },
    });
  }
}
