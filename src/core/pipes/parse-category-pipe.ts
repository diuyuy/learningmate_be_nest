import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonException } from '../exception/common-exception';

@Injectable()
export class ParseCategoryPipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) return 'all';

    const validator = z.union([
      z.literal('all'),
      z.literal('과학'),
      z.literal('공공'),
      z.literal('경제'),
      z.literal('금융'),
      z.literal('사회'),
      z.literal('경영'),
    ]);

    const result = validator.safeParse(value);

    if (!result.success) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    return result.data;
  }
}
