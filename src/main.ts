import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ApiResponse } from './core/api-response/api-response';
import { PageResponse } from './core/api-response/page-response';
import { BigIntInterceptor } from './core/interceptors/bigint.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { MemberResponseDto } from './features/member/dto/member-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new BigIntInterceptor());

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Learningmate API Documentation')
      .setDescription('The Learningmate API description')
      .setVersion('1.0')
      .addTag('Learningmate')
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, {
        extraModels: [ApiResponse, PageResponse, MemberResponseDto],
      });

    SwaggerModule.setup('api/swagger', app, documentFactory, {
      jsonDocumentUrl: 'api/swagger/json',
    });
  }

  await app.listen(process.env.PORT ?? 8080);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
