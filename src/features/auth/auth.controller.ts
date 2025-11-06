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
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ApiResponse } from 'src/core/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EnvSchema } from 'src/core/config/validate-env';
import { CommonException } from 'src/core/exception/common-exception';
import { CookieService } from 'src/core/infrastructure/cookie/cookie.service';
import { ParseEmailPipe } from 'src/core/pipes/parse-email-pipe';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { AuthService } from './auth.service';
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

@ApiTags('Auth')
@Public()
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
    private readonly configService: ConfigService<EnvSchema, true>,
  ) {}

  @ApiOperation({
    summary: '구글 OAuth 로그인 요청',
    description: '구글 OAuth 로그인 페이지로 리다이렉트합니다.',
  })
  @UseGuards(GoogleOauthAuthGuard)
  @Get('login/oauth2/google')
  googleOauthRequest() {}

  @ApiOperation({
    summary: '구글 OAuth 콜백',
    description: '구글 OAuth 인증 후 콜백을 처리합니다.',
  })
  @UseGuards(GoogleOauthAuthGuard)
  @Get('callback/google')
  async googleOauthCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      req.user,
    );

    this.setCookie(res, accessToken, refreshToken);

    res.redirect(`${this.configService.get('AUTH_BASE_URL')}/oauth-redirect`);
  }

  @ApiOperation({
    summary: '이메일 존재 여부 확인',
    description: '입력한 이메일이 이미 등록되어 있는지 확인합니다.',
  })
  @ApiQuery({
    name: 'email',
    description: '확인할 이메일 주소',
    example: 'user@example.com',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '이메일 존재 여부',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'boolean',
              example: true,
              description: '이메일 존재 여부',
            },
          },
        },
      ],
    },
  })
  @Get('emails/existence')
  async checkEmailExists(@Query('email', ParseEmailPipe) email: string) {
    const isExists = await this.authService.checkEmailExists(email);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      isExists,
    );
  }

  @ApiOperation({
    summary: '이메일/비밀번호 로그인',
    description: '이메일과 비밀번호로 로그인합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '로그인 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MemberResponseDto),
            },
          },
        },
      ],
    },
  })
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

  @ApiOperation({
    summary: '회원가입',
    description: '새로운 회원을 등록합니다.',
  })
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponseDecorator({
    status: 201,
    description: '회원가입 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.MEMBER_CREATED)
            .message,
        },
      },
    },
  })
  @Post('sign-up')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    await this.authService.signUp(signUpRequestDto);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.MEMBER_CREATED),
    );
  }

  @ApiOperation({
    summary: '인증 코드 발송',
    description: '이메일로 인증 코드를 발송합니다.',
  })
  @ApiBody({ type: AuthCodeGetRequestDto })
  @ApiResponseDecorator({
    status: 200,
    description: '인증 코드 발송 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Post('send-auth-code')
  async sendAuthCodeMail(@Body() authCodeRequest: AuthCodeGetRequestDto) {
    await this.authService.sendAuthCodeMail(authCodeRequest.email);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @ApiOperation({
    summary: '인증 코드 검증',
    description: '발송된 인증 코드를 검증합니다.',
  })
  @ApiBody({ type: AuthCodeValidateRequestDto })
  @ApiResponseDecorator({
    status: 200,
    description: '인증 코드 검증 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Post('auth-code/validate')
  async validateAuthCode(
    @Body() authCodeValidateRequestDto: AuthCodeValidateRequestDto,
  ) {
    await this.authService.validateAuthCode(authCodeValidateRequestDto);
    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃하고 쿠키를 삭제합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
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

  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_REFRESH_TOKEN),
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    this.setCookie(res, accessToken, newRefreshToken);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }

  @ApiOperation({
    summary: '비밀번호 재설정 이메일 발송',
    description: '비밀번호 재설정을 위한 이메일을 발송합니다.',
  })
  @ApiBody({ type: SendResetPasswdRequestDto })
  @ApiResponseDecorator({
    status: 201,
    description: '비밀번호 재설정 이메일 발송 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: '생성됨' },
      },
    },
  })
  @Post('password-resets')
  async sendPasswdResetMail(
    @Body() sendResetPasswdRequestDto: SendResetPasswdRequestDto,
  ) {
    await this.authService.sendResetPasswordEmail(sendResetPasswdRequestDto);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.CREATED));
  }

  @ApiOperation({
    summary: '비밀번호 재설정',
    description: '인증 토큰을 사용하여 비밀번호를 재설정합니다.',
  })
  @ApiBody({ type: PasswdResetRequestDto })
  @ApiResponseDecorator({
    status: 200,
    description: '비밀번호 재설정 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Patch('password-resets')
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
