import { IsEmail } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  email: string;
}
