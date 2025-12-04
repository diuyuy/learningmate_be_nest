import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Quiz } from 'generated/prisma/client';

type QuizWithArticle = {
  Article: {
    keywordId: bigint;
  };
  id: bigint;
  answer: string;
  description: string;
  explanation: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
};

export class QuizResponseDto {
  @ApiProperty({ description: '퀴즈 ID', type: 'string' })
  id: bigint;

  @ApiProperty({ description: '퀴즈 설명' })
  description: string;

  @ApiProperty({ description: '퀴즈 선택지 1' })
  question1: string;

  @ApiProperty({ description: '퀴즈 선택지 2' })
  question2: string;

  @ApiProperty({ description: '퀴즈 선택지 3' })
  question3: string;

  @ApiProperty({ description: '퀴즈 선택지 4' })
  question4: string;

  @ApiPropertyOptional({ description: '퀴즈 정답' })
  answer?: string;

  @ApiPropertyOptional({ description: '퀴즈 해설' })
  explanation?: string;

  @ApiPropertyOptional({ description: '퀴즈 채점 결과 (정답/오답)' })
  status?: string;

  constructor({
    id,
    description,
    question1,
    question2,
    question3,
    question4,
    answer,
    explanation,
    status,
  }: QuizResponseDto) {
    this.id = id;
    this.description = description;
    this.question1 = question1;
    this.question2 = question2;
    this.question3 = question3;
    this.question4 = question4;
    this.answer = answer;
    this.explanation = explanation;
    this.status = status;
  }

  static from(this: void, quiz: Quiz): QuizResponseDto {
    return new QuizResponseDto(quiz);
  }

  static fromList(quizzes: Quiz[]): QuizResponseDto[] {
    return quizzes.map((quiz) => new QuizResponseDto(quiz));
  }

  static fromGrading(
    quiz: QuizWithArticle,
    isCorrect: boolean,
    memberAnswer: string,
  ): QuizResponseDto {
    return new QuizResponseDto({
      ...quiz,
      answer: isCorrect ? quiz.answer : memberAnswer,
      explanation: isCorrect ? quiz.explanation : undefined,
      status: isCorrect ? '정답' : '오답',
    });
  }
}
