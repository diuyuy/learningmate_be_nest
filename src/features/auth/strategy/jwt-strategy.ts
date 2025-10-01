import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envSchema } from 'src/common/config/validate-env';
import { PASSPORT_STRATEGY_NAME } from 'src/common/constants/passport-strategy-name';
import z from 'zod';

type JwtPayload = {
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.JWT,
) {
  constructor(
    private readonly configService: ConfigService<
      z.infer<typeof envSchema>,
      true
    >,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req.cookies.accessToken as string | undefined) ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub };
  }
}
