import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: '기사 제목',
    minLength: 1,
    maxLength: 255,
    example: '한국은행, 기준금리 동결 결정',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: '기사 내용',
    minLength: 1,
    example:
      '한국은행이 금융통화위원회를 열고 기준금리를 현행 3.5%로 유지하기로 결정했다...',
  })
  @IsString()
  @MinLength(1)
  content: string;
}
