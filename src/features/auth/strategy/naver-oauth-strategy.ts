import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EnvSchema } from 'src/core/config/validate-env';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { CommonException } from 'src/core/exception/common-exception';
import { MemberService } from 'src/features/member/member.service';
import { MemberInfo } from '../types/member-info';

@Injectable()
export class NaverOauthStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.NAVER_OAUTH,
) {
  constructor(
    configService: ConfigService<EnvSchema, true>,
    private readonly memberService: MemberService,
  ) {
    super({
      clientID: configService.get<string>('AUTH_NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('AUTH_NAVER_SECRET'),
      callbackURL: configService.get<string>('AUTH_NAVER_REDIRECT_URL'),
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<MemberInfo> {
    if (!profile.emails || !profile.emails[0].value) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.NAVER_OAUTH_FAILURE),
      );
    }

    const email = profile.emails[0].value;

    const member = await this.memberService.findByEmail(email);

    if (!member) {
      const { id, role } = await this.memberService.create({ email });

      return { id: String(id), role };
    }

    return { id: String(member.id), role: member.role };
  }
}
