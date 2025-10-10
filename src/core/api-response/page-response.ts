import { ApiProperty } from '@nestjs/swagger';
import { Pageable } from '../types/types';

export class PageResponse<T> {
  @ApiProperty({
    description: '페이지 데이터 목록',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: '현재 페이지 번호 (0부터 시작)',
    example: 0,
  })
  page: number;

  @ApiProperty({
    description: '페이지 크기',
    example: 10,
  })
  size: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '전체 데이터 개수',
    example: 100,
  })
  totalElements: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;

  constructor({
    items,
    page,
    size,
    hasNext,
    totalElements,
    totalPages,
  }: PageResponse<T>) {
    this.items = items;
    this.page = page;
    this.size = size;
    this.hasNext = hasNext;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
  }

  static from<T, R>(items: T[], totalElements: number, pageAble: Pageable<R>) {
    return new PageResponse({
      items,
      page: pageAble.page,
      size: pageAble.size,
      hasNext: totalElements > pageAble.page * pageAble.size + items.length,
      totalElements,
      totalPages: Math.ceil(totalElements / pageAble.size),
    });
  }
}
