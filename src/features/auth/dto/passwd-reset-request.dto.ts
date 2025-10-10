import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class PasswdResetRequestDto {
  @ApiProperty({
    description: '새 비밀번호',
    example: 'newpassword123',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @Length(8, 128)
  password: string;

  @ApiProperty({
    description: '인증 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  authToken: string;
}
