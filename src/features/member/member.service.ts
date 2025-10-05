import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
import { MemberResponseDto } from './dto';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const newMember = await this.prismaService.member.create({
      data: createMemberDto,
    });

    return newMember;
  }

  async findByEmail(email: string) {
    return this.prismaService.member.findUnique({
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
      where: { email },
    });
  }

  async findById(id: bigint) {
    const member = await this.prismaService.member.findUnique({
      where: { id },
    });

    if (!member)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );

    return MemberResponseDto.from(member);
  }

  async updatePassword(email: string, passwordHash: string) {
    await this.prismaService.member.update({
      data: {
        passwordHash,
      },
      where: {
        email,
      },
    });
  }
}
