import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { STUDY_FLAGS } from '../../core/constants/study-flag';
import { MemberQuizRequestDto } from './dto/member-quiz-request.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizRequestDto } from './dto/update-quiz-request.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prismaService: PrismaService) {}

  async findManyByArticleId(articleId: bigint) {
    const quizzes = await this.prismaService.quiz.findMany({
      where: {
        articleId,
      },
    });

    return QuizResponseDto.fromList(quizzes);
  }

  async findQuizDetailsByArticleId(articleId: bigint) {
    const quizzes = await this.prismaService.quiz.findMany({
      where: {
        articleId,
      },
    });

    return quizzes.map(QuizResponseDto.from);
  }

  async updateQuiz(id: bigint, updateQuizRequestDto: UpdateQuizRequestDto) {
    const quiz = await this.prismaService.quiz.update({
      data: updateQuizRequestDto,
      where: {
        id,
      },
    });

    return QuizResponseDto.from(quiz);
  }

  async solveQuiz({
    memberId,
    articleId,
    quizId,
    memberQuizRequest,
  }: {
    memberId: bigint;
    articleId: bigint;
    quizId: bigint;
    memberQuizRequest: MemberQuizRequestDto;
  }) {
    return this.prismaService.$transaction(async (prisma) => {
      const quiz = await this.validateAndGetQuiz(prisma, quizId, articleId);
      await this.saveAnswer(prisma, memberId, quizId, memberQuizRequest);
      const isCorrect = quiz.answer === memberQuizRequest.memberAnswer;

      await this.updateStudyProgressIfNeeded(
        prisma,
        memberId,
        articleId,
        quiz.article.keywordId,
      );

      return QuizResponseDto.fromGrading(
        quiz,
        isCorrect,
        memberQuizRequest.memberAnswer,
      );
    });
  }

  private async validateAndGetQuiz(
    prisma: Parameters<
      Parameters<typeof this.prismaService.$transaction>[0]
    >[0],
    quizId: bigint,
    articleId: bigint,
  ) {
    const quiz = await prisma.quiz.findUnique({
      select: {
        id: true,
        description: true,
        question1: true,
        question2: true,
        question3: true,
        question4: true,
        answer: true,
        explanation: true,
        article: {
          select: {
            id: true,
            keywordId: true,
          },
        },
      },
      where: {
        id: quizId,
        articleId,
      },
    });

    if (!quiz) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.QUIZ_NOT_FOUND),
      );
    }

    if (quiz.article.id !== articleId) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    return quiz;
  }

  private async saveAnswer(
    prisma: Parameters<
      Parameters<typeof this.prismaService.$transaction>[0]
    >[0],
    memberId: bigint,
    quizId: bigint,
    memberQuizRequest: MemberQuizRequestDto,
  ) {
    await prisma.memberQuiz.upsert({
      where: {
        quizId_memberId: {
          quizId,
          memberId,
        },
      },
      create: {
        memberId,
        quizId,
        memberAnswer: memberQuizRequest.memberAnswer,
      },
      update: {
        memberAnswer: memberQuizRequest.memberAnswer,
      },
    });
  }

  private async updateStudyProgressIfNeeded(
    prisma: Parameters<
      Parameters<typeof this.prismaService.$transaction>[0]
    >[0],
    memberId: bigint,
    articleId: bigint,
    keywordId: bigint,
  ) {
    const solvedQuizzesCount = await prisma.memberQuiz.count({
      where: {
        quiz: {
          articleId,
        },
        memberId,
      },
    });

    if (solvedQuizzesCount >= 5) {
      await prisma.$queryRaw`
      INSERT INTO Study(memberId, keywordId, studyStats)
        VALUES(${memberId}, ${keywordId}, ${STUDY_FLAGS.QUIZ})
        ON DUPLICATE KEY UPDATE
        studyStats = studyStats | ${STUDY_FLAGS.QUIZ}
    `;
    }
  }
}
