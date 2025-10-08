export type PageSortOption<T> = {
  sortProp: T;
  sortDirection: 'asc' | 'desc';
};

export type Pageable<T> = {
  page: number;
  size: number;
  sortProp: T;
  sortDirection: 'asc' | 'desc';
};

export type ReviewSortOption = 'createdAt' | 'updatedAt' | 'likeCounts';
export type ArticleScrapSortOption =
  | 'createdAt'
  | 'scrapCounts'
  | 'viewsCounts';
