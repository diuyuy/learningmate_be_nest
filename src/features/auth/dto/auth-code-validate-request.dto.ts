import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class AuthCodeValidateRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: '인증 코드는 6자리 숫자여야 합니다.' })
  authCode: string;
}
