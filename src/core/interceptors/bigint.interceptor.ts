import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.convertBigIntsToNumber(data)));
  }

  private convertBigIntsToNumber(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      return Number(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertBigIntsToNumber(item));
    }

    if (data instanceof Date) {
      return data;
    }

    if (typeof data === 'object') {
      const result: object = {};
      Object.keys(data).forEach((key) => {
        result[key] = this.convertBigIntsToNumber(data[key]);
      });

      return result;
    }

    return data;
  }
}
