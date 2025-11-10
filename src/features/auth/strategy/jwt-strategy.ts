import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envSchema } from 'src/core/config/validate-env';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import z from 'zod';
import { MemberInfo, MemberRole } from '../types/member-info';

type JwtPayload = {
  sub: string;
  role: MemberRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.JWT,
) {
  constructor(configService: ConfigService<z.infer<typeof envSchema>, true>) {
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

  validate(payload: JwtPayload): MemberInfo {
    return { id: payload.sub, role: payload.role };
  }
}
