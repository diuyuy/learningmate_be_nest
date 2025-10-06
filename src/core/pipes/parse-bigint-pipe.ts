import { Injectable, PipeTransform } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonException } from '../exception/common-exception';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    try {
      return BigInt(value);
    } catch (error) {
      throw new CommonException(
        ResponseStatusFactory.create(
          ResponseCode.BAD_REQUEST,
          (error as Error).message,
        ),
      );
    }
  }
}
