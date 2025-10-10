import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class SignUpRequestDto {
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
  })
  @Length(8)
  password: string;

  @ApiProperty({
    description: '인증 코드 (6자리 숫자)',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @Matches(/^\d{6}$/)
  authCode: string;
}
