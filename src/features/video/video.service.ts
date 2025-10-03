import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
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
}
