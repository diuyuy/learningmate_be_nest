import { ApiProperty } from '@nestjs/swagger';
import { Video } from 'generated/prisma';

export class VideoResponseDto {
  @ApiProperty({ description: '영상 ID', type: Number })
  id: bigint;

  @ApiProperty({ description: '영상 링크' })
  link: string;

  constructor({ id, link }: VideoResponseDto) {
    this.id = id;
    this.link = link;
  }

  static from(video: Video): VideoResponseDto {
    return new VideoResponseDto(video);
  }
}
