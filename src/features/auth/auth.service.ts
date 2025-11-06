import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EnvSchema } from 'src/core/config/validate-env';
import { CommonException } from 'src/core/exception/common-exception';
import { EmailService } from 'src/core/infrastructure/email/email.service';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberService } from '../member/member.service';
import {
  AuthCodeValidateRequestDto,
  LoginResultDto,
  PasswdResetRequestDto,
  SendResetPasswdRequestDto,
} from './dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { MemberInfo } from './types/member-info';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    private readonly configService: ConfigService<EnvSchema, true>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly redisService: IoRedisService,
  ) {}

  private readonly SALT_OR_AROUNDS = 10;

  async signIn(memberInfo: MemberInfo) {
    const accessToken = this.generateAccessToken(memberInfo);
    const refreshToken = await this.generateRefreshToken(memberInfo);

    return { accessToken, refreshToken };
  }

  async signInByEmailPasswd(memberId: string): Promise<LoginResultDto> {
    const memberResponse = await this.memberService.findById(BigInt(memberId));

    const accessToken = this.generateAccessToken({
      id: memberId,
      role: memberResponse.role,
    });
    const refreshToken = await this.generateRefreshToken({
      id: memberId,
      role: memberResponse.role,
    });

    return { accessToken, refreshToken, memberResponse };
  }

  async signOut(refreshToken: string) {
    await this.redisService.del(refreshToken);
  }

  async signUp({ email, password, authCode }: SignUpRequestDto) {
    await this.validateAuthCode({ email, authCode });
    await this.redisService.del(this.generateAuthCodeKey(email));

    const passwordHash = await bcrypt.hash(password, this.SALT_OR_AROUNDS);

    await this.memberService.create({
      email,
      passwordHash,
    });
  }

  async refreshToken(refreshToken: string) {
    const memberInfoJson = await this.redisService.get(
      this.generateRefreshTokenKey(refreshToken),
    );

    if (!memberInfoJson) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_REFRESH_TOKEN),
      );
    }

    const memberInfo = JSON.parse(memberInfoJson) as MemberInfo;

    const accessToken = this.generateAccessToken(memberInfo);

    const newRefreshToken = await this.generateRefreshToken(memberInfo);

    // 기존 refresh token 삭제 (재사용 방지)
    await this.redisService.del(this.generateRefreshTokenKey(refreshToken));

    return { accessToken, refreshToken: newRefreshToken };
  }

  async validateUser(email: string, passwd: string) {
    const member = await this.memberService.findByEmail(email);

    if (!member || !member.passwordHash) return null;

    return (await bcrypt.compare(passwd, member.passwordHash)) ? member : null;
  }

  async checkEmailExists(email: string) {
    const member = await this.memberService.findByEmail(email);

    return !!member;
  }

  async sendAuthCodeMail(email: string) {
    const authCode = randomInt(1000000).toString().padStart(6, '0');
    try {
      await this.redisService.set(
        this.generateAuthCodeKey(email),
        authCode,
        3 * 60,
      );
    } catch (error) {
      console.error(error);
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
    await this.emailService.sendAuthCodeEmail(email, authCode);
  }

  async sendResetPasswordEmail({ email }: SendResetPasswdRequestDto) {
    const member = await this.memberService.findByEmail(email);

    if (!member) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.EMAIL_NOT_FOUND),
      );
    }

    const authToken = uuidv4();

    try {
      await this.redisService.set(authToken, email, 10 * 60);
      await this.emailService.sendResetPasswordEmail(email, authToken);
    } catch (error) {
      console.error(error);
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
  }

  async resetPassword({ password, authToken }: PasswdResetRequestDto) {
    const email = await this.redisService.get(authToken);

    if (!email) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.AUTH_TOKEN_INVALID),
      );
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_OR_AROUNDS);

    await Promise.all([
      this.memberService.updatePassword(email, passwordHash),
      this.redisService.del(authToken),
    ]);
  }

  async validateAuthCode({ email, authCode }: AuthCodeValidateRequestDto) {
    const storedAuthCode = await this.redisService.get(
      this.generateAuthCodeKey(email),
    );

    if (storedAuthCode !== authCode) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.AUTH_CODE_INVALID),
      );
    }
  }

  private generateAccessToken({ id, role }: MemberInfo) {
    const payload = { sub: id, role };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(memberInfo: MemberInfo) {
    const refreshToken = uuidv4();
    const expiresDay = this.configService.get<number>(
      'AUTH_REFRESH_TOKEN_EXPIRATION_DAYS',
    );

    await this.redisService.set(
      this.generateRefreshTokenKey(refreshToken),
      JSON.stringify(memberInfo),
      expiresDay * 24 * 3600,
    );

    return refreshToken;
  }

  private generateAuthCodeKey(email: string) {
    return `AUTH_CODE:${email}`;
  }

  private generateRefreshTokenKey(refreshToken: string) {
    return `REFRESH:${refreshToken}`;
  }
}
