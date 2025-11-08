import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReviewCreateRequestDto {
  @ApiProperty({
    description: '리뷰 내용 1',
    example: '오늘 배운 경제 용어는 매우 유익했습니다.',
  })
  @IsNotEmpty({ message: '리뷰를 입력해주세요.' })
  content1: string;
}
