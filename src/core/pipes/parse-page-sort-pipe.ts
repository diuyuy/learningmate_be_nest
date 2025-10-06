import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonException } from '../exception/common-exception';
import { PageSortOption } from '../types/types';

@Injectable()
export class ParsePageSortPipe<T>
  implements PipeTransform<string | undefined, PageSortOption<T>>
{
  constructor(private readonly validKeys: [T, ...T[]]) {}

  transform(value: string | undefined): PageSortOption<T> {
    if (!value) {
      return {
        sortProp: 'createdAt' as T,
        sortDirection: 'desc',
      };
    }

    const sortOptionSchema = z.object({
      sortProp: z.enum(this.validKeys as [string, ...string[]]),
      sortDirection: z.union([z.literal('asc'), z.literal('desc')]),
    });

    const [sortProp, sortDirection = 'desc'] = value.split(',');
    const result = sortOptionSchema.safeParse({ sortProp, sortDirection });

    if (!result.success) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.BAD_REQUEST),
      );
    }

    return {
      sortProp: result.data.sortProp as T,
      sortDirection: result.data.sortDirection,
    };
  }
}
