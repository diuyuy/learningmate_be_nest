import { ApiProperty } from '@nestjs/swagger';

export class UpdateKeywordDto {
  @ApiProperty({
    description: '키워드 이름',
    example: '인플레이션',
  })
  name: string;

  @ApiProperty({
    description: '카테고리 이름',
    example: '금융',
  })
  categoryName: string;

  @ApiProperty({
    description: '키워드 설명',
    example: '경제 용어에 대한 상세 설명',
  })
  description: string;
}
