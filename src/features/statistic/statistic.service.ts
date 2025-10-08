import { Injectable } from '@nestjs/common';
import { getWatchedVideoCounts } from 'generated/prisma/sql';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { StudyAchivementResponseDto } from './dto/study-achivement-response.dto';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        this.prismaService.$queryRawTyped(getWatchedVideoCounts(memberId)),
      ]);

    return StudyAchivementResponseDto.from({
      studyCounts,
      reviewCounts,
      solvedQuizCounts,
      watchedVideoCounts: Number(videoCountsResult[0].watchedVideoCounts),
    });
  }
}
