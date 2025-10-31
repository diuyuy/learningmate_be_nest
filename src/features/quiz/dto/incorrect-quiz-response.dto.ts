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
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  keywordId: bigint;
  keywordName: string;
  keywordDescription: string;
  date: Date;
};

export class IncorrectQuizResponseDto {
  @ApiProperty({ description: '퀴즈 ID', example: 1 })
  id: bigint;

  @ApiProperty({
    description: '관련 기사 정보',
    example: {
      id: 1,
      title: '1인당 국민소득의 개념',
      keyword: {
        id: 1,
        name: '1인당 국민소득',
        description:
          '국민소득을 총국민 수로 나눈 값. 해당 국가의 소득 수준을 보여주는 가장 대표적인 지표이다.',
        date: '2025-10-20 12:33:32.149064',
      },
    },
  })
  article: {
    id: bigint;
    title: string;
    keyword: {
      id: bigint;
      name: string;
      description: string;
      date: Date;
    };
  };

  @ApiProperty({ description: '퀴즈 문제', example: '이 경제 용어의 의미는?' })
  description: string;

  @ApiProperty({
    description: '퀴즈 해설',
    example: '이 용어는 경제학에서 중요한 개념입니다.',
  })
  explanation: string;

  @ApiProperty({ description: '정답', example: '1' })
  answer: string;

  @ApiProperty({ description: '사용자가 제출한 오답', example: '2' })
  memberAnswer: string;

  @ApiProperty({
    description: '오답 제출 시각',
    example: '2025-01-15T10:30:00Z',
  })
  answerCreatedAt: Date;

  @ApiProperty({ description: '퀴즈 선택지 1' })
  question1: string;

  @ApiProperty({ description: '퀴즈 선택지 2' })
  question2: string;

  @ApiProperty({ description: '퀴즈 선택지 3' })
  question3: string;

  @ApiProperty({ description: '퀴즈 선택지 4' })
  question4: string;

  constructor({
    id,
    article,
    description,
    explanation,
    answer,
    memberAnswer,
    answerCreatedAt,
    question1,
    question2,
    question3,
    question4,
  }: IncorrectQuizResponseDto) {
    this.id = id;
    this.article = article;
    this.description = description;
    this.explanation = explanation;
    this.answer = answer;
    this.memberAnswer = memberAnswer;
    this.answerCreatedAt = answerCreatedAt;
    this.question1 = question1;
    this.question2 = question2;
    this.question3 = question3;
    this.question4 = question4;
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
      question1,
      question2,
      question3,
      question4,
      keywordId,
      keywordName,
      keywordDescription,
      date,
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
        keyword: {
          id: keywordId,
          name: keywordName,
          description: keywordDescription,
          date,
        },
      },
      question1,
      question2,
      question3,
      question4,
    });
  }
}
