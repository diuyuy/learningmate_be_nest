import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;
}
