import { IsOptional, Length } from 'class-validator';

export class MemberUpdateRequestDto {
  @IsOptional()
  @Length(8, 128)
  password?: string;

  @IsOptional()
  @Length(1, 50)
  nickname?: string;
}
