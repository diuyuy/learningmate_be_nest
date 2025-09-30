import { Member } from 'generated/prisma';

export class MemberResponseDto {
  id: bigint;
  email: string;
  nickname: string | null;
  imageUrl: string | null;

  constructor({ id, email, nickname, imageUrl }: MemberResponseDto) {
    this.id = id;
    this.email = email;
    this.nickname = nickname;
    this.imageUrl = imageUrl;
  }

  static from(member: Member): MemberResponseDto {
    return new MemberResponseDto(member);
  }
}
