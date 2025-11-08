import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/core/config/validate-env';
import { IoRedisModule } from 'src/core/infrastructure/io-redis/io-redis.module';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { QuizModule } from '../quiz/quiz.module';
import { ReviewModule } from '../review/review.module';
import { ArticleController } from './article.controller';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';

@Module({
  imports: [
    PrismaModule,
    QuizModule,
    ReviewModule,
    IoRedisModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvSchema, true>) => ({
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService],
})
export class ArticleModule {}
