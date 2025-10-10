import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendResetPasswdRequestDto {
  @ApiProperty({
    description: '비밀번호 재설정 이메일을 받을 이메일',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
