import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/core/config/validate-env';
import { BATCH_OPTIONS } from 'src/core/constants/batch-options';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { ArticleModule } from '../article/article.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordModule } from '../keyword/keyword.module';
import { QuizModule } from '../quiz/quiz.module';
import { VideoModule } from '../video/video.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ArticleModule,
    VideoModule,
    KeywordModule,
    QuizModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvSchema, true>) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: BATCH_OPTIONS.QUEUE_NAME,
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
