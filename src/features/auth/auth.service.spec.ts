/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomInt: jest.fn(() => 123456),
  randomUUID: jest.fn(() => 'test-uuid'),
}));

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma';
import { CommonException } from 'src/core/exception/common-exception';
import { EmailService } from 'src/core/infrastructure/email/email.service';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { MemberService } from '../member/member.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let memberService: jest.Mocked<MemberService>;
  let ioRedisService: jest.Mocked<IoRedisService>;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockMember = {
    id: BigInt(1),
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    role: Role.USER,
  };

  const mockMemberResponse = {
    id: BigInt(1),
    email: 'test@example.com',
    role: 'USER' as const,
    nickname: 'testUser',
    imageUrl: null,
  };

  beforeEach(async () => {
    const mockMemberService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockIoRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      srem: jest.fn(),
      sadd: jest.fn(),
      smembers: jest.fn(),
      expire: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockEmailService = {
      sendAuthCodeEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MemberService,
          useValue: mockMemberService,
        },
        {
          provide: IoRedisService,
          useValue: mockIoRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    memberService = module.get(MemberService);
    ioRedisService = module.get(IoRedisService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);

    // bcrypt mock 설정
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInByEmailPasswd', () => {
    it('should return tokens on successful login', async () => {
      const memberId = '1';
      const accessToken = 'access-token';

      memberService.findById.mockResolvedValue(mockMemberResponse);
      jwtService.sign.mockReturnValueOnce(accessToken);
      configService.get.mockReturnValue('7d');

      const result = await service.signInByEmailPasswd(memberId);

      expect(memberService.findById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.memberResponse).toEqual(mockMemberResponse);
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with valid auth code', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password123',
        authCode: '123456',
      };

      ioRedisService.get.mockResolvedValue('123456');
      ioRedisService.del.mockResolvedValue(1);
      memberService.create.mockResolvedValue({
        id: BigInt(1),
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: Role.USER,
        nickname: null,
        imageUrl: null,
        status: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.signUp(signUpDto);

      expect(ioRedisService.get).toHaveBeenCalledWith(
        'AUTH_CODE:test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(memberService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      });
      expect(ioRedisService.del).toHaveBeenCalledWith(
        'AUTH_CODE:test@example.com',
      );
    });

    it('should fail to sign up with invalid auth code', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password123',
        authCode: '000000',
      };

      ioRedisService.get.mockResolvedValue('123456');

      await expect(service.signUp(signUpDto)).rejects.toThrow(CommonException);
    });
  });

  describe('signOut', () => {
    it('should delete refresh token on sign out', async () => {
      const refreshToken = 'refresh-token';
      const memberInfo = JSON.stringify({ id: '1', role: 'USER' });

      ioRedisService.get.mockResolvedValue(memberInfo);
      ioRedisService.srem.mockResolvedValue(1);
      ioRedisService.del.mockResolvedValue(1);

      await service.signOut(refreshToken);

      expect(ioRedisService.get).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
      expect(ioRedisService.srem).toHaveBeenCalledWith(
        'MEMBER_TOKENS:1',
        refreshToken,
      );
      expect(ioRedisService.del).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
    });

    it('should not throw error when signing out with non-existent refresh token', async () => {
      const refreshToken = 'invalid-token';

      ioRedisService.get.mockResolvedValue(null);
      ioRedisService.del.mockResolvedValue(0);

      await expect(service.signOut(refreshToken)).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should issue new tokens with valid refresh token', async () => {
      const refreshToken = 'old-refresh-token';
      const memberInfo = JSON.stringify({ id: '1', role: 'USER' });
      const newAccessToken = 'new-access-token';

      ioRedisService.get.mockResolvedValue(memberInfo);
      jwtService.sign.mockReturnValue(newAccessToken);
      configService.get.mockReturnValue('7d');
      ioRedisService.del.mockResolvedValue(1);
      ioRedisService.srem.mockResolvedValue(1);

      const result = await service.refreshToken(refreshToken);

      expect(ioRedisService.get).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(ioRedisService.del).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
    });

    it('should throw exception when requesting with invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      ioRedisService.get.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user with valid email and password', async () => {
      memberService.findByEmail.mockResolvedValue(mockMember);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(memberService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual(mockMember);
    });

    it('should return null with wrong password', async () => {
      memberService.findByEmail.mockResolvedValue(mockMember);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('should return null with non-existent email', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });

  describe('checkEmailExists', () => {
    it('should return true if email exists', async () => {
      memberService.findByEmail.mockResolvedValue(mockMember);

      const result = await service.checkEmailExists('test@example.com');

      expect(memberService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      const result = await service.checkEmailExists('notfound@example.com');

      expect(result).toBe(false);
    });
  });

  describe('sendAuthCodeMail', () => {
    it('should successfully send auth code email', async () => {
      const email = 'test@example.com';

      emailService.sendAuthCodeEmail.mockResolvedValue(undefined);

      await service.sendAuthCodeMail(email);

      expect(ioRedisService.set).toHaveBeenCalledWith(
        'AUTH_CODE:test@example.com',
        '123456',
        180,
      );
      expect(emailService.sendAuthCodeEmail).toHaveBeenCalledWith(
        email,
        '123456',
      );
    });

    it('should throw exception when Redis save fails', async () => {
      const email = 'test@example.com';

      ioRedisService.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.sendAuthCodeMail(email)).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('validateAuthCode', () => {
    it('should validate valid auth code', async () => {
      const dto = {
        email: 'test@example.com',
        authCode: '123456',
      };

      ioRedisService.get.mockResolvedValue('123456');

      await expect(service.validateAuthCode(dto)).resolves.not.toThrow();
    });

    it('should throw exception with invalid auth code', async () => {
      const dto = {
        email: 'test@example.com',
        authCode: '000000',
      };

      ioRedisService.get.mockResolvedValue('123456');

      await expect(service.validateAuthCode(dto)).rejects.toThrow(
        CommonException,
      );
    });

    it('should throw exception when auth code is expired', async () => {
      const dto = {
        email: 'test@example.com',
        authCode: '123456',
      };

      ioRedisService.get.mockResolvedValue(null);

      await expect(service.validateAuthCode(dto)).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const dto = {
        password: 'newPassword123',
        authToken: 'valid-auth-token',
      };

      ioRedisService.get.mockResolvedValue('test@example.com');
      memberService.findByEmail.mockResolvedValue(mockMember);
      memberService.updatePassword.mockResolvedValue(undefined);
      ioRedisService.del.mockResolvedValue(1);
      ioRedisService.smembers.mockResolvedValue([]);

      await service.resetPassword(dto);

      expect(ioRedisService.get).toHaveBeenCalledWith('valid-auth-token');
      expect(memberService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(memberService.updatePassword).toHaveBeenCalledWith(
        'test@example.com',
        'hashedPassword',
      );
      expect(ioRedisService.del).toHaveBeenCalledWith('valid-auth-token');
    });

    it('should throw exception with invalid auth token', async () => {
      const dto = {
        password: 'newPassword123',
        authToken: 'invalid-token',
      };

      ioRedisService.get.mockResolvedValue(null);

      await expect(service.resetPassword(dto)).rejects.toThrow(CommonException);
    });

    it('should throw exception with non-existent email', async () => {
      const dto = {
        password: 'newPassword123',
        authToken: 'valid-auth-token',
      };

      ioRedisService.get.mockResolvedValue('notfound@example.com');
      memberService.findByEmail.mockResolvedValue(null);

      await expect(service.resetPassword(dto)).rejects.toThrow(CommonException);
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('should revoke all refresh tokens', async () => {
      const memberId = '1';
      const tokens = ['token1', 'token2', 'token3'];

      ioRedisService.smembers.mockResolvedValue(tokens);
      ioRedisService.del.mockResolvedValue(1);

      await service.revokeAllRefreshTokens(memberId);

      expect(ioRedisService.smembers).toHaveBeenCalledWith('MEMBER_TOKENS:1');
      expect(ioRedisService.del).toHaveBeenCalledTimes(4); // 3 tokens + 1 member tokens key
      expect(ioRedisService.del).toHaveBeenCalledWith('REFRESH:token1');
      expect(ioRedisService.del).toHaveBeenCalledWith('REFRESH:token2');
      expect(ioRedisService.del).toHaveBeenCalledWith('REFRESH:token3');
      expect(ioRedisService.del).toHaveBeenCalledWith('MEMBER_TOKENS:1');
    });

    it('should handle normally when there are no tokens to revoke', async () => {
      const memberId = '1';

      ioRedisService.smembers.mockResolvedValue([]);

      await expect(
        service.revokeAllRefreshTokens(memberId),
      ).resolves.not.toThrow();
    });
  });
});
