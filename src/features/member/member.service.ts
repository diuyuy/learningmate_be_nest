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

  findAll() {
    return `This action returns all member`;
  }

  async findByEmail(email: string) {
    const member = await this.prismaService.member.findUnique({
      where: { email },
    });

    return member ? MemberResponseDto.from(member) : null;
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
}
