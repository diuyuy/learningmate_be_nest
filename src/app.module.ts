import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './core/config/validate-env';
import { AdminModule } from './features/admin/admin.module';
import { ArticleModule } from './features/article/article.module';
import { AuthModule } from './features/auth/auth.module';
import { KeywordModule } from './features/keyword/keyword.module';
import { MemberModule } from './features/member/member.module';
import { QuizModule } from './features/quiz/quiz.module';
import { ReviewModule } from './features/review/review.module';
import { StatisticModule } from './features/statistic/statistic.module';
import { StudyModule } from './features/study/study.module';
import { VideoModule } from './features/video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    AdminModule,
    AuthModule,
    ArticleModule,
    ReviewModule,
    KeywordModule,
    MemberModule,
    StudyModule,
    StatisticModule,
    QuizModule,
    VideoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
