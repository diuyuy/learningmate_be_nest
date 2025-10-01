import { Injectable } from '@nestjs/common';
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

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
