import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { EnvSchema } from 'src/common/config/validate-env';
import { CommonException } from 'src/common/exception/common-exception';
import { ParseEmailPipe } from 'src/common/pipes/parse-email-pipe';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { Public } from './decorators/public';
import {
  AuthCodeGetRequestDto,
  AuthCodeValidateRequestDto,
  PasswdResetRequestDto,
  SendResetPasswdRequestDto,
  SignUpRequestDto,
} from './dto';
import { GoogleOauthAuthGuard } from './guards/google-oauth-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
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
  async googleOauthCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      req.user,
    );

    this.setCookie(res, accessToken, refreshToken);

    res.redirect(`${this.configService.get('AUTH_BASE_URL')}/oauth-redirect`);
  }

  @Get('emails/existence')
  async checkEmailExists(@Query('email', ParseEmailPipe) email: string) {
    const isExists = await this.authService.checkEmailExists(email);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      isExists,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signInByEmailPwd(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, memberResponse } =
      await this.authService.signInByEmailPasswd(req.user.id);

    this.setCookie(res, accessToken, refreshToken);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      memberResponse,
    );
  }

  @Post('sign-up')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    await this.authService.signUp(signUpRequestDto);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.MEMBER_CREATED),
    );
  }

  @Post('send-auth-code')
  async sendAuthCodeMail(@Body() authCodeRequest: AuthCodeGetRequestDto) {
    await this.authService.sendAuthCodeMail(authCodeRequest.email);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Post('auth-code/validate')
  async validateAuthCode(
    @Body() authCodeValidateRequestDto: AuthCodeValidateRequestDto,
  ) {
    await this.authService.validateAuthCode(authCodeValidateRequestDto);
    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Post('sign-out')
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.cookies.accessToken as string | undefined;
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!accessToken || !refreshToken) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    await this.authService.signOut(refreshToken);

    res.cookie('accessToken', '', this.cookieService.getSignOutOptions());
    res.cookie('refreshToken', '', this.cookieService.getSignOutOptions());

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    this.setCookie(res, accessToken, newRefreshToken);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @Post('passwd-resets')
  async sendPasswdResetMail(
    @Body() sendResetPasswdRequestDto: SendResetPasswdRequestDto,
  ) {
    await this.authService.sendResetPasswordEmail(sendResetPasswdRequestDto);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.CREATED));
  }

  @Patch()
  async resetPasswd(@Body() passwdResetRequestDto: PasswdResetRequestDto) {
    await this.authService.resetPassword(passwdResetRequestDto);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  private setCookie(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(
      'accessToken',
      accessToken,
      this.cookieService.getAccessTokenCookieOption(),
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      this.cookieService.getRefreshTokenCookieOption(),
    );
  }
}
