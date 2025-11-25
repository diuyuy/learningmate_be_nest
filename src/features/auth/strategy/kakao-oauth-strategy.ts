import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EnvSchema } from 'src/core/config/validate-env';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { CommonException } from 'src/core/exception/common-exception';
import { MemberService } from 'src/features/member/member.service';
import { MemberInfo } from '../types/member-info';

type Profile = {
  _json: {
    id: number;
    connected_at: Date;
    kakao_account: {
      has_email: boolean;
      email_needs_agreement: boolean;
      is_email_valid: boolean;
      is_email_verified: boolean;
      email: string | null | undefined;
    };
  };
};

@Injectable()
export class KakaoOauthStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.KAKAO_OAUTH,
) {
  constructor(
    configService: ConfigService<EnvSchema, true>,
    private readonly memberService: MemberService,
  ) {
    super({
      clientID: configService.get<string>('AUTH_KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('AUTH_KAKAO_SECRET'),
      callbackURL: configService.get<string>('AUTH_KAKAO_REDIRECT_URL'),
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<MemberInfo> {
    const email = profile._json.kakao_account.email;

    if (!email) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.KAKAO_OAUTH_FAILURE),
      );
    }

    const member = await this.memberService.findByEmail(email);

    if (!member) {
      const { id, role } = await this.memberService.create({ email });

      return { id: String(id), role };
    }

    return { id: String(member.id), role: member.role };
  }
}
