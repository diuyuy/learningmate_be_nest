import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';

@Injectable()
export class GoogleOauthAuthGuard extends AuthGuard(
  PASSPORT_STRATEGY_NAME.GOOGLE_OAUTH,
) {}
