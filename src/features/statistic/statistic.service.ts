import { Injectable } from '@nestjs/common';
import {
  getStudyCategoryStatistics,
  getWatchedVideoCounts,
} from 'generated/prisma/sql';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
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
            studyStats: STUDY_FLAGS.COMPLETE,
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

        this.prismaService.$queryRawTyped(getWatchedVideoCounts(memberId)),
      ]);

    return StudyAchivementResponseDto.from({
      studyCounts,
      reviewCounts,
      solvedQuizCounts,
      watchedVideoCounts: Number(videoCountsResult[0].watchedVideoCounts),
    });
  }

  async getStudyCategoryStats(memberId: bigint) {
    const queryResult = await this.prismaService.$queryRawTyped(
      getStudyCategoryStatistics(memberId),
    );

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
}
