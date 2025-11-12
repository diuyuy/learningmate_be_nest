import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CACHE_PREFIX } from 'src/core/constants/cache-prfix';
import { CommonException } from 'src/core/exception/common-exception';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { ArticleScrapSortOption, Pageable } from 'src/core/types/types';
import { ArticleRepository } from './article.repository';
import { ArticleDetailResponseDto } from './dto/article-detail-response.dto';
import { ArticlePreviewResponseDto } from './dto/article-preview-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findArticlePreviewsByKeyword(keywordId: bigint) {
    const articleList = await this.cacheService.withCaching({
      cacheKey: this.cacheService.generateCacheKey(CACHE_PREFIX.ARTICLE, {
        keywordId,
      }),
      fetchFn: async () =>
        this.articleRepository.findManyByKeywordId(keywordId),
      ttlSeconds: 3600,
    });

    return articleList.map(ArticlePreviewResponseDto.from);
  }

  async findArticlePreviewsInAdmin(keywordId: bigint) {
    const articleList =
      await this.articleRepository.findManyByKeywordId(keywordId);

    return articleList.map(ArticlePreviewResponseDto.from);
  }

  async findById(
    id: bigint,
    memberId: bigint,
  ): Promise<ArticleDetailResponseDto> {
    const article = await this.cacheService.withCaching({
      cacheKey: this.cacheService.generateCacheKey(CACHE_PREFIX.ARTICLE, {
        articleId: id,
      }),
      fetchFn: async () => this.articleRepository.findById(id),
      ttlSeconds: 3600,
    });

    if (!article)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.ARTICLE_NOT_FOUND),
      );

    const scrappedByMe = await this.articleRepository.isScrappedByMember(
      id,
      memberId,
    );

    return ArticleDetailResponseDto.from({
      ...article,
      scrappedByMe,
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

  async updateArticle(articleId: bigint, updateArticleDto: UpdateArticleDto) {
    return this.articleRepository.updateArticle(articleId, updateArticleDto);
  }
}
