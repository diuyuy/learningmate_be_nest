import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MemberQuizRequestDto {
  @ApiProperty({ description: '사용자가 제출한 퀴즈 답안' })
  @IsNotEmpty({ message: 'answer를 입력해주세요.' })
  memberAnswer: string;
}
