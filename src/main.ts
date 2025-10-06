import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './core/interceptors/bigint.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  console.log(process.env.CORS_ORIGIN);
  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new BigIntInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
