import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 128)
  password: string;
}
