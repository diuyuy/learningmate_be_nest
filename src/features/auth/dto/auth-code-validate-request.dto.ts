import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class AuthCodeValidateRequestDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '인증 코드 (6자리 숫자)',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: '인증 코드는 6자리 숫자여야 합니다.' })
  authCode: string;
}
