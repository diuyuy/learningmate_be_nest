import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonException } from 'src/core/exception/common-exception';
import { ArticleScrapSortOption, Pageable } from 'src/core/types/types';
import { ArticleRepository } from './article.repository';
import { ArticlePreviewResponseDto } from './dto/article-preview-response.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async findArticlePreviewsByKeyword(keywordId: bigint) {
    const articleList =
      await this.articleRepository.findManyByKeywordId(keywordId);

    return articleList.map(ArticlePreviewResponseDto.from);
  }

  async findById(id: bigint, memberId: bigint): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.findById(id, memberId);

    if (!article)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.ARTICLE_NOT_FOUND),
      );

    const { ArticleScrap, ...rest } = article;

    return ArticleResponseDto.from({
      ...rest,
      scrappedByMe: ArticleScrap.length > 0,
    });
  }

  async findArticleScraps(
    memberId: bigint,
    pageAble: Pageable<ArticleScrapSortOption>,
  ) {
    return this.articleRepository.findArticleScraps(memberId, pageAble);
  }

  async scrapArticle(memberId: bigint, articleId: bigint) {
    await this.articleRepository.scrapArticle(memberId, articleId);
  }

  async cancleScrap(memberId: bigint, articleId: bigint) {
    await this.articleRepository.cancelScrap(memberId, articleId);
  }

  async createArticle(keywordId: bigint, createArticleDto: CreateArticleDto) {
    return this.articleRepository.createArticle(keywordId, createArticleDto);
  }

  async updateArticle(articleId: bigint, updateArticleDto: UpdateArticleDto) {
    return this.articleRepository.updateArticle(articleId, updateArticleDto);
  }
}
