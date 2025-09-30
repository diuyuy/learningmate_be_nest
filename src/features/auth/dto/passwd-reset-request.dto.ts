import { IsNotEmpty, Length } from 'class-validator';

export class PasswdResetRequestDto {
  @IsNotEmpty()
  @Length(8, 128)
  password: string;

  @IsNotEmpty()
  authToken: string;
}
