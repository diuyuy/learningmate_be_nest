import { Video } from 'generated/prisma';

export class VideoResponseDto {
  id: bigint;
  link: string;

  constructor({ id, link }: VideoResponseDto) {
    this.id = id;
    this.link = link;
  }

  static from(video: Video): VideoResponseDto {
    return new VideoResponseDto(video);
  }
}
