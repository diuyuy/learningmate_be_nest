import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { CommonException } from './common-exception';

@Catch(CommonException)
export class CommonExceptionFilter implements ExceptionFilter {
  catch(exception: CommonException, host: ArgumentsHost) {
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

    console.log('CommonException occurred:', JSON.stringify(logData, null, 2));

    response.status(status).json(exception.getResponse());
  }
}
