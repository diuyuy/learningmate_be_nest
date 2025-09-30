import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class SignUpRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Length(8)
  password: string;

  @Matches(/^\d{6}$/)
  authCode: string;
}
