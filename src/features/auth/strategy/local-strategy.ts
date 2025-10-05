import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { PASSPORT_STRATEGY_NAME } from 'src/common/constants/passport-strategy-name';
import { CommonException } from 'src/common/exception/common-exception';
import { AuthService } from '../auth.service';
import { MemberInfo } from '../types/member-info';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.LOCAL,
) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<MemberInfo> {
    const member = await this.authService.validateUser(username, password);

    if (!member)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_AUTH_FORMAT),
      );

    return { id: String(member.id) };
  }
}
