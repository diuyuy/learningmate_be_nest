import { Injectable } from '@nestjs/common';
import { upsertStudyFlag } from 'generated/prisma/sql';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { VideoResponseDto } from './dto/video-response.dto';

@Injectable()
export class VideoService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByKeywordId(keywordId: bigint) {
    const video = await this.prismaService.video.findFirst({
      where: {
        keywordId,
      },
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
    await this.prismaService.$queryRawTyped(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      upsertStudyFlag(
        memberId,
        keywordId,
        STUDY_FLAGS.VIDEO,
        STUDY_FLAGS.VIDEO,
      ),
    );
  }
}
