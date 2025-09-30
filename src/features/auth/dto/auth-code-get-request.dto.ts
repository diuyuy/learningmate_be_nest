import { IsEmail } from 'class-validator';

export class AuthCodeGetRequestDto {
  @IsEmail()
  email: string;
}
