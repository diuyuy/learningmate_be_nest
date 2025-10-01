import { ResponseStatus } from './response-status';

export class ApiResponse<T> {
  readonly status: number;
  readonly message: string;
  readonly result?: T;

  constructor({ status, message, result }: ApiResponse<T>) {
    this.status = status;
    this.message = message;
    this.result = result;
  }

  static from<T>(responseStatus: ResponseStatus, result?: T): ApiResponse<T> {
    return new ApiResponse({ ...responseStatus, result });
  }
}
