import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ApiResponse } from './core/api-response/api-response';
import { BigIntInterceptor } from './core/interceptors/bigint.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { MemberResponseDto } from './features/member/dto/member-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  console.log(process.env.CORS_ORIGIN);
  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new BigIntInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Learningmate API Documentation')
    .setDescription('The Learningmate API description')
    .setVersion('1.0')
    .addTag('Learningmate')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [ApiResponse, MemberResponseDto],
    });

  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
