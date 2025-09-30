import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendResetPasswdRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
