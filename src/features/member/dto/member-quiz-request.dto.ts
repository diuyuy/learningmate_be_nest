import { IsNotEmpty } from 'class-validator';

export class MemberQuizRequestDto {
  @IsNotEmpty({ message: 'answer를 입력해주세요.' })
  memberAnswer: string;
}
