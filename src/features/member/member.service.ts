import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { S3Service } from 'src/core/infrastructure/s3/s3.service';
import { MemberResponseDto, MemberUpdateRequestDto } from './dto';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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
        role: true,
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

  async updateMember(
    id: bigint,
    { password, ...rest }: MemberUpdateRequestDto,
  ) {
    const member = await this.prismaService.member.update({
      data: { passwordHash: password, ...rest },
      where: {
        id,
      },
    });

    return MemberResponseDto.from(member);
  }

  async updateProfileImage(id: bigint, image: Express.Multer.File) {
    const member = await this.prismaService.member.findUnique({
      select: {
        imageUrl: true,
      },
      where: {
        id,
      },
    });

    if (!member) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_MEMBER_ID),
      );
    }

    const newImgUrl = await this.s3Service.uploadImage(image);

    const updatedMember = await this.prismaService.member.update({
      data: {
        imageUrl: newImgUrl,
      },
      where: {
        id,
      },
    });

    if (member.imageUrl) {
      try {
        await this.s3Service.deleteImage(member.imageUrl);
      } catch (error) {
        console.error(error);
      }
    }

    return MemberResponseDto.from(updatedMember);
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

  async removeMember(id: bigint) {
    const member = await this.prismaService.member.findUnique({
      select: { imageUrl: true },
      where: {
        id,
      },
    });

    if (!member) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_MEMBER_ID),
      );
    }

    const deletedAt = new Date();

    await Promise.all([
      this.prismaService.member.update({
        data: {
          email: `deleted_${id}${Date.now()}`,
          nickname: null,
          passwordHash: null,
          imageUrl: null,
          deletedAt: `${deletedAt.toISOString()}`,
        },
        where: {
          id,
        },
      }),
      member.imageUrl && this.s3Service.deleteImage(member.imageUrl),
    ]);
  }
}
