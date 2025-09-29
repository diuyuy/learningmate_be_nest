import { HttpException } from '@nestjs/common';
import { ResponseStatus } from '../api-response/response-status';

export class CommonException extends HttpException {
  constructor(responseStatus: ResponseStatus) {
    super(responseStatus, responseStatus.httpStatus);
  }
}
