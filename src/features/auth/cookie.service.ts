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
      maxAge: +this.configService.get('AUTH_EXPIRATION_MILLS'),
      sameSite: this.configService.get('AUTH_COOKIE_SAME_SITE'),
    };
  }
}
