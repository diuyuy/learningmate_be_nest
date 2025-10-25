import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuizRequestDto {
  @ApiProperty({ description: '퀴즈 설명' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(255)
  description: string;

  @ApiProperty({ description: '퀴즈 해설' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(512)
  explanation: string;

  @ApiProperty({ description: '퀴즈 선택지 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  question1: string;

  @ApiProperty({ description: '퀴즈 선택지 2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  question2: string;

  @ApiProperty({ description: '퀴즈 선택지 3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  question3: string;

  @ApiProperty({ description: '퀴즈 선택지 4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  question4: string;

  @ApiProperty({ description: '퀴즈 정답', enum: ['1', '2', '3', '4'] })
  @IsString()
  @IsIn(['1', '2', '3', '4'], {
    message: '정답은 1, 2, 3, 4 중 하나여야 합니다',
  })
  answer: string;
}
