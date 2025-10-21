import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: '카테고리 ID',
    type: Number,
    example: 1,
  })
  id: bigint;

  @ApiProperty({
    description: '카테고리 이름',
    example: '금융',
  })
  name: string;
}
