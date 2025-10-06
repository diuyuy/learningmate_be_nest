import { Member } from 'generated/prisma';

export class MemberResponseDto {
  id: bigint;
  email: string;
  role: 'USER' | 'ADMIN';
  nickname: string | null;
  imageUrl: string | null;

  constructor({ id, email, nickname, imageUrl, role }: MemberResponseDto) {
    this.id = id;
    this.email = email;
    this.nickname = nickname;
    this.imageUrl = imageUrl;
    this.role = role;
  }

  static from = (member: Member): MemberResponseDto => {
    return new MemberResponseDto(member);
  };
}
