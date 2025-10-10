import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @Length(8, 128)
  password: string;
}
