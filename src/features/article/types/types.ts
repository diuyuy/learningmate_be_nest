export type ScrappedArticleFromPrismaDto = {
  summary: string;
  content: string;
  id: bigint;
  title: string;
  publishedAt: Date;
  scrapCount: bigint;
  views: bigint;
  keyword: {
    description: string;
    name: string;
    id: bigint;
    todaysKeyword: {
      date: Date;
    }[];
  };
};
