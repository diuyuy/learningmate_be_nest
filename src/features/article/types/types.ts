export type ScrappedArticleFromPrismaDto = {
  summary: string;
  content: string;
  id: bigint;
  title: string;
  publishedAt: Date;
  scrapCount: bigint;
  views: bigint;
  Keyword: {
    description: string;
    name: string;
    id: bigint;
    TodaysKeyword: {
      date: Date;
    }[];
  };
};
