import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { Public } from './decorators/public';
import { GoogleOauthAuthGuard } from './guards/google-oauth-auth.guard';
import type { RequestWithUser } from './types/request-with-user';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @UseGuards(GoogleOauthAuthGuard)
  @Get('login/oauth2/google')
  googleOauthRequest() {}

  @UseGuards(GoogleOauthAuthGuard)
  @Get('callback/google')
  googleOauthCallback(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = this.authService.signIn(req.user);

    res.cookie(
      'accessToken',
      accessToken,
      this.cookieService.getAccessTokenCookieOption(),
    );

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
