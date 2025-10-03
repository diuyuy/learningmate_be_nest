import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-module/prisma.service';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly previewSelect = {
    id: true,
    title: true,
    content: true,
    publishedAt: true,
    press: true,
  } as const;

  async findManyByKeywordId(keywordId: bigint) {
    return this.prismaService.article.findMany({
      select: this.previewSelect,
      where: {
        keywordId,
      },
    });
  }

  async findById(id: bigint) {
    return this.prismaService.article.findUnique({
      where: {
        id,
      },
    });
  }
}
