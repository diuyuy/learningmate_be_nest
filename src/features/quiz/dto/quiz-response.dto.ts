import { Quiz } from 'generated/prisma';

type QuizWithArticle = {
  article: {
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
  id: bigint;
  description: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;

  answer?: string;

  explanation?: string;

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
