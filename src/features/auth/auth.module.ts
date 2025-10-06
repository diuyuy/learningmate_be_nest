import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { EnvSchema } from 'src/core/config/validate-env';
import { CookieModule } from 'src/core/infrastructure/cookie/cookie.module';
import { EmailModule } from 'src/core/infrastructure/email/email.module';
import { IoRedisModule } from 'src/core/infrastructure/io-redis/io-redis.module';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { MemberModule } from '../member/member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOauthAuthGuard } from './guards/google-oauth-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleOauthStrategy } from './strategy/google-oauth-strategy';
import { JwtStrategy } from './strategy/jwt-strategy';
import { LocalStrategy } from './strategy/local-strategy';

@Module({
  imports: [
    PrismaModule,
    MemberModule,
    CookieModule,
    EmailModule,
    JwtModule.registerAsync({
      useFactory: (configServie: ConfigService<EnvSchema, true>) => ({
        secret: configServie.get('AUTH_SECRET'),
        signOptions: {
          expiresIn: +configServie.get<string>('AUTH_EXPIRATION_MILLS'),
        },
      }),
      inject: [ConfigService],
    }),
    IoRedisModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvSchema, true>) => ({
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
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
    LocalStrategy,
    LocalAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
