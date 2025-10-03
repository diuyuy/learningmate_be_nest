import { Pageable } from '../types/types';

export class PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  hasNext: boolean;
  totalElements: number;
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
