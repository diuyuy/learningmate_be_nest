import { ApiProperty } from '@nestjs/swagger';
import type { Category, Video } from 'generated/prisma';
import { VideoResponseDto } from 'src/features/video/dto/video-response.dto';
import { CategoryResponseDto } from './category-response.dto';

export class KeywordDetailResponseDto {
  @ApiProperty({
    description: '키워드 ID',
    type: 'string',
    example: '1',
  })
  id: bigint;

  @ApiProperty({
    description: '카테고리 정보',
    type: () => CategoryResponseDto,
  })
  category: CategoryResponseDto;

  @ApiProperty({
    description: '관련 영상 정보',
    type: () => [VideoResponseDto],
    nullable: true,
  })
  video: VideoResponseDto | null;

  @ApiProperty({
    description: '키워드 설명',
    example: '경제 용어에 대한 상세 설명',
  })
  description: string;

  @ApiProperty({
    description: '키워드 이름',
    example: '인플레이션',
  })
  name: string;

  constructor({
    id,
    category,
    description,
    name,
    video,
  }: KeywordDetailResponseDto) {
    this.id = id;
    this.category = category;
    this.description = description;
    this.name = name;
    this.video = video;
  }

  static from(
    this: void,
    {
      id,
      category,
      video,
      description,
      name,
    }: {
      id: bigint;
      category: Category;
      video: Video[];
      description: string;
      name: string;
    },
  ) {
    return new KeywordDetailResponseDto({
      id,
      category,
      description,
      name,
      video: video[0] ?? null,
    });
  }
}
