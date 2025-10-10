import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호 해시',
    example: 'hashed_password_string',
    required: false,
  })
  @IsOptional()
  @IsString()
  passwordHash?: string;
}
