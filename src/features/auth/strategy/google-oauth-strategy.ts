import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { envSchema } from 'src/core/config/validate-env';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { CommonException } from 'src/core/exception/common-exception';
import { MemberService } from 'src/features/member/member.service';
import z from 'zod';
import { MemberInfo, MemberRole } from '../types/member-info';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.GOOGLE_OAUTH,
) {
  constructor(
    private readonly configService: ConfigService<
      z.infer<typeof envSchema>,
      true
    >,
    private readonly memberService: MemberService,
  ) {
    super({
      clientID: configService.get('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('AUTH_GOOGLE_SECRET'),
      callbackURL: configService.get('AUTH_GOOGLE_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<MemberInfo> {
    if (!profile.emails)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.GOOGLE_OAUTH_FAILURE),
      );

    const email = profile.emails[0].value;

    const member = await this.memberService.findByEmail(email);

    if (!member) {
      const { id, role } = await this.memberService.create({ email });
      return { id: String(id), role: String(role) as MemberRole };
    }

    return {
      id: String(member.id),
      role: String(member.role) as MemberRole,
    };
  }
}
