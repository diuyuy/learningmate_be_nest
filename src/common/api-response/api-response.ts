import { ResponseStatus } from './response-status';

export class ApiResponse<T> {
  readonly httpStatus: number;
  readonly message: string;
  readonly result: T;

  constructor({ httpStatus, message, result }: ApiResponse<T>) {
    this.httpStatus = httpStatus;
    this.message = message;
    this.result = result;
  }

  static from<T>(responseStatus: ResponseStatus, result: T): ApiResponse<T> {
    return new ApiResponse({ ...responseStatus, result });
  }
}
