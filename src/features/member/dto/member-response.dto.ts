import { ApiProperty } from '@nestjs/swagger';
import { Member } from 'generated/prisma/client';

export class MemberResponseDto {
  @ApiProperty({
    description: '회원 ID',
    example: 1,
    type: 'integer',
  })
  id: bigint;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '역할',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
  })
  role: 'USER' | 'ADMIN';

  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
    nullable: true,
  })
  nickname: string | null;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
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
