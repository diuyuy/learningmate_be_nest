import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { EnvSchema } from 'src/common/config/validate-env';
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
    private readonly configService: ConfigService<EnvSchema, true>,
  ) {}

  @UseGuards(GoogleOauthAuthGuard)
  @Get('login/oauth2/google')
  googleOauthRequest() {}

  @UseGuards(GoogleOauthAuthGuard)
  @Get('callback/google')
  googleOauthCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const { accessToken } = this.authService.signIn(req.user);

    res.cookie(
      'accessToken',
      accessToken,
      this.cookieService.getAccessTokenCookieOption(),
    );

    res.redirect(`${this.configService.get('AUTH_BASE_URL')}/oauth-redirect`);
  }
}
