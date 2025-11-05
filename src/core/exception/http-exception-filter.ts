import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      statusCode: status,
      errorMessage: exception.message,
      stack: exception.stack,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestBody: request.body,
      queryParams: request.query,
      headers: {
        'content-type': request.get('Content-Type'),
        authorization: request.get('Authorization') ? '[MASKED]' : undefined,
      },
    };

    this.logger.error(
      'CommonException occurred:',
      JSON.stringify(logData, null, 2),
    );

    response.status(status).json(exception.getResponse());
  }
}
