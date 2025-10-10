import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class MemberUpdateRequestDto {
  @ApiProperty({
    description: '비밀번호 (8-128자)',
    example: 'password123!',
    minLength: 8,
    maxLength: 128,
    required: false,
  })
  @IsOptional()
  @Length(8, 128)
  password?: string;

  @ApiProperty({
    description: '닉네임 (1-50자)',
    example: '홍길동',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @Length(1, 50)
  nickname?: string;
}
