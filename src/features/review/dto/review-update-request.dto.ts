import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReviewUpdateRequestDto {
  @ApiProperty({
    description: '리뷰 내용 1',
    example: '오늘 배운 경제 용어는 매우 유익했습니다.',
  })
  @IsNotEmpty({ message: 'content1를 입력해주세요.' })
  content1: string;

  @ApiProperty({
    description: '리뷰 내용 2',
    example: '특히 실생활에 적용할 수 있는 예시들이 좋았습니다.',
  })
  @IsNotEmpty({ message: 'content2를 입력해주세요.' })
  content2: string;

  @ApiProperty({
    description: '리뷰 내용 3',
    example: '다음에도 이런 내용을 배우고 싶습니다.',
  })
  @IsNotEmpty({ message: 'content3을 입력해주세요.' })
  content3: string;
}
