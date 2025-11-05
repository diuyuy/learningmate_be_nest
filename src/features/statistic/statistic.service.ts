import { Injectable } from '@nestjs/common';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { MainStudyAchievementsResponseDto } from './dto/main-study-achievement-response.dto';
import { QuizStatsResponseDto } from './dto/quiz-stats-response.dto';
import { StudyAchivementResponseDto } from './dto/study-achivement-response.dto';
import { StudyCatStatsResponseDto } from './dto/study-cat-stats-response.dto';

@Injectable()
export class StatisticService {
  constructor(private readonly prismaService: PrismaService) {}
  async getStudyAchivement(memberId: bigint) {
    const [studyCounts, reviewCounts, solvedQuizCounts, videoCountsResult] =
      await Promise.all([
        this.prismaService.study.count({
          where: {
            memberId,
            studyStats: {
              gte: 1,
            },
          },
        }),
        this.prismaService.review.count({
          where: {
            memberId,
          },
        }),
        this.prismaService.memberQuiz.count({
          where: {
            memberId,
          },
        }),

        this.prismaService.$queryRaw<{ watchedVideoCounts: bigint }[]>`
          SELECT COUNT(*) as watchedVideoCounts FROM Study
          WHERE memberId = ${memberId} AND (studyStats & 4) > 0
        `,
      ]);

    return StudyAchivementResponseDto.from({
      studyCounts,
      reviewCounts,
      solvedQuizCounts,
      watchedVideoCounts: Number(videoCountsResult[0].watchedVideoCounts),
    });
  }

  async getStudyCategoryStats(memberId: bigint) {
    const queryResult = await this.prismaService.$queryRaw<
      { name: string | null; totalCounts: bigint }[]
    >`
      SELECT c.name, COUNT(s.studyStats) as totalCounts FROM Study AS s
      INNER JOIN Keyword AS k ON k.id = s.keywordId
      INNER JOIN Category AS c ON k.categoryId = c.id
      WHERE s.memberId = ${memberId}
      GROUP BY c.name WITH ROLLUP
    `;

    return StudyCatStatsResponseDto.from(queryResult);
  }

  async getQuizStats(memberId: bigint): Promise<QuizStatsResponseDto> {
    const answers = await this.prismaService.memberQuiz.findMany({
      select: {
        memberAnswer: true,
        quiz: {
          select: {
            answer: true,
          },
        },
      },
      where: {
        memberId,
      },
    });

    return {
      correctCounts: answers.filter((v) => v.memberAnswer === v.quiz.answer)
        .length,
      totalCounts: answers.length,
    };
  }

  async getMainStudyAchievements(
    memberId: bigint,
  ): Promise<MainStudyAchievementsResponseDto> {
    const [
      monthlyAttendanceDays,
      totalStudiedKeywords,
      mostStudied,
      totalReviews,
    ] = await Promise.all([
      this.prismaService.study.count({
        where: {
          memberId,
          createdAt: {
            gte: this.getMonthStartDate(),
            lt: this.getMonthStartDate(true),
          },
        },
      }),
      this.prismaService.study.count({
        where: {
          memberId,
          studyStats: STUDY_FLAGS.COMPLETE,
        },
      }),
      this.prismaService.$queryRaw<
        { name: string | undefined; counts: bigint }[]
      >`
        SELECT c.name, COUNT(*) AS counts
        FROM Study AS s
        INNER JOIN Keyword AS k ON k.id = s.keywordId
        INNER JOIN Category AS c ON k.categoryId = c.id
        WHERE s.memberId = ${memberId}
        GROUP BY c.name
        ORDER BY counts DESC
        LIMIT 1
      `,
      this.prismaService.review.count({
        where: {
          memberId,
        },
      }),
    ]);

    const mostStudiedCategory = mostStudied[0]?.name ?? null;

    return {
      monthlyAttendanceDays,
      totalStudiedKeywords,
      mostStudiedCategory,
      totalReviews,
    };
  }

  private getMonthStartDate(isNext: boolean = false) {
    const now = new Date();

    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + (isNext ? 1 : 0), 1, 0),
    );
  }
}
