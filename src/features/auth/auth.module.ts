import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { envSchema } from 'src/common/config/validate-env';
import { PrismaModule } from 'src/common/prisma-module/prisma.module';
import z from 'zod';
import { MemberModule } from '../member/member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { GoogleOauthAuthGuard } from './guards/google-oauth-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOauthStrategy } from './strategy/google-oauth-strategy';
import { JwtStrategy } from './strategy/jwt-strategy';

@Module({
  imports: [
    PrismaModule,
    MemberModule,
    JwtModule.registerAsync({
      useFactory: (
        configServie: ConfigService<z.infer<typeof envSchema>, true>,
      ) => ({
        secret: configServie.get('AUTH_SECRET'),
        signOptions: { expiresIn: +configServie.get('AUTH_EXPIRATION_MILLS') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleOauthStrategy,
    GoogleOauthAuthGuard,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CookieService,
  ],
})
export class AuthModule {}
