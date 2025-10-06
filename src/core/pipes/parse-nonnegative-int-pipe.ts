import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonException } from '../exception/common-exception';

@Injectable()
export class ParseNonNegativeIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const positiveNumberSchema = z.number().nonnegative();
    const result = positiveNumberSchema.safeParse(+value);

    if (!result.success) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    return result.data;
  }
}
