import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ArticleModule } from './features/article/article.module';
import { ReviewModule } from './features/review/review.module';
import { KeywordModule } from './features/keyword/keyword.module';
import { MemberModule } from './features/member/member.module';
import { StudyModule } from './features/study/study.module';
import { StatisticModule } from './features/statistic/statistic.module';
import { QuizModule } from './features/quiz/quiz.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/config/validate-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    ArticleModule,
    ReviewModule,
    KeywordModule,
    MemberModule,
    StudyModule,
    StatisticModule,
    QuizModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
