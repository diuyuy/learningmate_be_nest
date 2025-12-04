import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CACHE_PREFIX } from 'src/core/constants/cache-prfix';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { CommonException } from 'src/core/exception/common-exception';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { VideoResponseDto } from './dto/video-response.dto';

@Injectable()
export class VideoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findByKeywordId(keywordId: bigint) {
    const video = await this.cacheService.withCaching({
      cacheKey: this.cacheService.generateCacheKey(CACHE_PREFIX.VIDEO, {
        keywordId,
      }),
      fetchFn: async () =>
        this.prismaService.video.findFirst({
          where: {
            keywordId,
          },
        }),
      ttlSeconds: 3600,
    });

    if (!video) {
      throw new CommonException(
        ResponseStatusFactory.create(
          ResponseCode.VIDEO_BY_KEYWORD_ID_NOT_FOUND,
        ),
      );
    }

    return VideoResponseDto.from(video);
  }

  async upsertFlag(memberId: bigint, keywordId: bigint) {
    await this.prismaService.$queryRaw`
      INSERT INTO Study(memberId, keywordId, studyStats)
        VALUES(${memberId}, ${keywordId}, ${STUDY_FLAGS.VIDEO})
        ON DUPLICATE KEY UPDATE
        studyStats = studyStats | ${STUDY_FLAGS.VIDEO}
    `;
  }

  async createVideo(keywordId: bigint, link: string) {
    const video = await this.prismaService.video.create({
      data: {
        keywordId,
        link,
      },
    });

    return VideoResponseDto.from(video);
  }

  async updateVideo(videoId: bigint, link: string) {
    const video = await this.prismaService.video.update({
      data: {
        link,
      },
      where: {
        id: videoId,
      },
    });

    await this.cacheService.invalidateByPattern(`${CACHE_PREFIX.VIDEO}:*`);

    return VideoResponseDto.from(video);
  }
}
