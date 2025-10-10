import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthCodeGetRequestDto {
  @ApiProperty({
    description: '인증 코드를 받을 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
