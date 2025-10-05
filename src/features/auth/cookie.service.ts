import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { envSchema } from 'src/common/config/validate-env';
import z from 'zod';

@Injectable()
export class CookieService {
  constructor(
    private readonly configService: ConfigService<
      z.infer<typeof envSchema>,
      true
    >,
  ) {}

  getAccessTokenCookieOption(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      maxAge: this.configService.get<number>('AUTH_EXPIRATION_MILLS'),
      sameSite: this.configService.get<'none' | 'lax'>('AUTH_COOKIE_SAME_SITE'),
    };
  }

  getRefreshTokenCookieOption(): CookieOptions {
    const expireDate = new Date();
    expireDate.setDate(
      expireDate.getDate() +
        this.configService.get<number>('AUTH_REFRESH_TOKEN_EXPIRATION_DAYS'),
    );

    return {
      httpOnly: true,
      secure: true,
      expires: expireDate,
      sameSite: this.configService.get<'none' | 'lax'>('AUTH_COOKIE_SAME_SITE'),
    };
  }

  getSignOutOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: this.configService.get<'none' | 'lax'>('AUTH_COOKIE_SAME_SITE'),
    };
  }
}
