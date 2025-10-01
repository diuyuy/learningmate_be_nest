import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
import { ArticlePreviewResponseDto } from './dto/article-preview-response.dto';
import { ArticleResponseDto } from './dto/article-response.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findArticlePreviewsByKeyword(keywordId: bigint) {
    const articleList = await this.prismaService.article.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        press: true,
      },
      where: {
        keywordId,
      },
    });

    return articleList.map(ArticlePreviewResponseDto.from);
  }

  async findById(id: bigint): Promise<ArticleResponseDto> {
    const article = await this.prismaService.article.findUnique({
      where: {
        id,
      },
    });

    if (!article)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.ARTICLE_NOT_FOUND),
      );

    return ArticleResponseDto.from(article);
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
