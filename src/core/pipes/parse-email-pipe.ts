import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonException } from '../exception/common-exception';

@Injectable()
export class ParseEmailPipe implements PipeTransform<string, string> {
  transform(value: string) {
    const emailSchema = z.email();

    const result = emailSchema.safeParse(value);

    if (!result.success) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_EMAIL),
      );
    }

    return result.data;
  }
}
