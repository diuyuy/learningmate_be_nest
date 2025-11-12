/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { S3Service } from 'src/core/infrastructure/s3/s3.service';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;

  let prismaService: {
    member: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  let s3Service: jest.Mocked<S3Service>;

  let ioRedisService: jest.Mocked<IoRedisService>;

  beforeEach(async () => {
    const mockPrisma = {
      member: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockS3Service = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    const mockIoRedisService = {
      smembers: jest.fn(),
      del: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: IoRedisService,
          useValue: mockIoRedisService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = moduleRef.get(MemberService);
    prismaService = moduleRef.get(PrismaService);
    ioRedisService = moduleRef.get(IoRedisService);
    s3Service = moduleRef.get(S3Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a member', async () => {
      const createMemberDto = {
        email: 'test@example.com',
        nickname: 'testuser',
        passwordHash: 'hashedPassword',
      };

      const expectedMember = {
        id: BigInt(1),
        ...createMemberDto,
        imageUrl: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaService.member.create.mockResolvedValue(expectedMember);

      const result = await service.create(createMemberDto);

      expect(result).toEqual(expectedMember);
      expect(prismaService.member.create).toHaveBeenCalledWith({
        data: createMemberDto,
      });
    });
  });

  describe('findByEmail', () => {
    it('should find a member by email', async () => {
      const email = 'test@example.com';
      const expectedMember = {
        id: BigInt(1),
        email,
        passwordHash: 'hashedPassword',
        role: 'USER',
      };

      prismaService.member.findUnique.mockResolvedValue(expectedMember);

      const result = await service.findByEmail(email);

      expect(result).toEqual(expectedMember);
      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
        },
        where: { email },
      });
    });
  });

  describe('findById', () => {
    it('should find a member by ID', async () => {
      const id = BigInt(1);
      const member = {
        id,
        email: 'test@example.com',
        nickname: 'testuser',
        imageUrl: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaService.member.findUnique.mockResolvedValue(member);

      const result = await service.findById(id);

      expect(result).toBeDefined();
      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw an exception when member is not found', async () => {
      const id = BigInt(999);

      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow();
      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('updateMember', () => {
    it('should update member information', async () => {
      const id = BigInt(1);
      const updateDto = {
        nickname: 'updatedNickname',
        password: 'newHashedPassword',
      };

      const updatedMember = {
        id,
        email: 'test@example.com',
        nickname: 'updatedNickname',
        passwordHash: 'newHashedPassword',
        imageUrl: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaService.member.update.mockResolvedValue(updatedMember);

      const result = await service.updateMember(id, updateDto);

      expect(result).toBeDefined();
      expect(prismaService.member.update).toHaveBeenCalledWith({
        data: {
          passwordHash: 'newHashedPassword',
          nickname: 'updatedNickname',
        },
        where: { id },
      });
    });
  });

  describe('updateProfileImage', () => {
    const mockFile = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    it('should update profile image (no previous image)', async () => {
      const id = BigInt(1);
      const newImageUrl = 'https://s3.amazonaws.com/new-image.jpg';

      const member = {
        imageUrl: null,
      };

      const updatedMember = {
        id,
        email: 'test@example.com',
        nickname: 'testuser',
        imageUrl: newImageUrl,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaService.member.findUnique.mockResolvedValue(member);
      s3Service.uploadImage.mockResolvedValue(newImageUrl);
      prismaService.member.update.mockResolvedValue(updatedMember);

      const result = await service.updateProfileImage(id, mockFile);

      expect(result).toBeDefined();
      expect(s3Service.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(prismaService.member.update).toHaveBeenCalledWith({
        data: { imageUrl: newImageUrl },
        where: { id },
      });
      expect(s3Service.deleteImage).not.toHaveBeenCalled();
    });

    it('should update profile image and delete the previous image', async () => {
      const id = BigInt(1);
      const oldImageUrl = 'https://s3.amazonaws.com/old-image.jpg';
      const newImageUrl = 'https://s3.amazonaws.com/new-image.jpg';

      const member = {
        imageUrl: oldImageUrl,
      };

      const updatedMember = {
        id,
        email: 'test@example.com',
        nickname: 'testuser',
        imageUrl: newImageUrl,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaService.member.findUnique.mockResolvedValue(member);
      s3Service.uploadImage.mockResolvedValue(newImageUrl);
      prismaService.member.update.mockResolvedValue(updatedMember);
      s3Service.deleteImage.mockResolvedValue(undefined);

      const result = await service.updateProfileImage(id, mockFile);

      expect(result).toBeDefined();
      expect(s3Service.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(s3Service.deleteImage).toHaveBeenCalledWith(oldImageUrl);
    });

    it('should throw an exception when updating image of non-existent member', async () => {
      const id = BigInt(999);

      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.updateProfileImage(id, mockFile)).rejects.toThrow();
      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        select: { imageUrl: true },
        where: { id },
      });
      expect(s3Service.uploadImage).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      const email = 'test@example.com';
      const passwordHash = 'newHashedPassword';

      prismaService.member.update.mockResolvedValue(undefined);

      await service.updatePassword(email, passwordHash);

      expect(prismaService.member.update).toHaveBeenCalledWith({
        data: { passwordHash },
        where: { email },
      });
    });
  });

  describe('removeMember', () => {
    it('should delete member (with image and refresh tokens)', async () => {
      const id = BigInt(1);
      const imageUrl = 'https://s3.amazonaws.com/image.jpg';
      const refreshTokens = ['token1', 'token2'];

      const member = {
        imageUrl,
      };

      prismaService.member.findUnique.mockResolvedValue(member);
      ioRedisService.smembers.mockResolvedValue(refreshTokens);
      prismaService.member.update.mockResolvedValue(undefined);
      s3Service.deleteImage.mockResolvedValue(undefined);

      await service.removeMember(id);

      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        select: { imageUrl: true },
        where: { id },
      });
      expect(ioRedisService.smembers).toHaveBeenCalledWith(
        `MEMBER_TOKENS:${id}`,
      );
      expect(prismaService.member.update).toHaveBeenCalled();
      expect(s3Service.deleteImage).toHaveBeenCalledWith(imageUrl);
      expect(ioRedisService.del).toHaveBeenCalledWith('REFRESH:token1');
      expect(ioRedisService.del).toHaveBeenCalledWith('REFRESH:token2');
      expect(ioRedisService.del).toHaveBeenCalledWith(`MEMBER_TOKENS:${id}`);
    });

    it('should delete member (without image and refresh tokens)', async () => {
      const id = BigInt(1);

      const member = {
        imageUrl: null,
      };

      prismaService.member.findUnique.mockResolvedValue(member);
      ioRedisService.smembers.mockResolvedValue([]);
      prismaService.member.update.mockResolvedValue(undefined);

      await service.removeMember(id);

      expect(prismaService.member.update).toHaveBeenCalled();
      expect(s3Service.deleteImage).not.toHaveBeenCalled();
    });

    it('should throw an exception when deleting non-existent member', async () => {
      const id = BigInt(999);

      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.removeMember(id)).rejects.toThrow();
      expect(prismaService.member.findUnique).toHaveBeenCalledWith({
        select: { imageUrl: true },
        where: { id },
      });
      expect(prismaService.member.update).not.toHaveBeenCalled();
    });
  });
});
