import { IsNotEmpty } from 'class-validator';

export class ReviewUpdateRequestDto {
  @IsNotEmpty({ message: 'content1를 입력해주세요.' })
  content1: string;

  @IsNotEmpty({ message: 'content2를 입력해주세요.' })
  content2: string;

  @IsNotEmpty({ message: 'content3을 입력해주세요.' })
  content3: string;
}
