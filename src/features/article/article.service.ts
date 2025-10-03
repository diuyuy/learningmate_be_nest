import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { CommonException } from 'src/common/exception/common-exception';
import { ArticlePreviewResponseDto } from './dto/article-preview-response.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ArticleRepository } from './article.repository';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async findArticlePreviewsByKeyword(keywordId: bigint) {
    const articleList =
      await this.articleRepository.findManyByKeywordId(keywordId);

    return articleList.map(ArticlePreviewResponseDto.from);
  }

  async findById(id: bigint): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.findById(id);

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
