import { Injectable } from '@nestjs/common';
import { CACHE_PREFIX } from 'src/core/constants/cache-prfix';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import { ArticleService } from '../article/article.service';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { UpdateKeywordDto } from '../keyword/dto';
import { KeywordService } from '../keyword/keyword.service';
import { QuizResponseDto } from '../quiz/dto/quiz-response.dto';
import { UpdateQuizRequestDto } from '../quiz/dto/update-quiz-request.dto';
import { QuizService } from '../quiz/quiz.service';
import { VideoService } from '../video/video.service';
import { BatchService } from './batch.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly keywordService: KeywordService,
    private readonly videoService: VideoService,
    private readonly quizService: QuizService,
    private readonly batchService: BatchService,
    private readonly cacheService: CacheService,
  ) {}

  async findKeywords(
    query: string,
    category: string,
    pageAble: Pageable<KeywordSortOption>,
  ) {
    return this.keywordService.findKeywords(query, category, pageAble);
  }

  async findQuizzes(articleId: bigint) {
    return this.quizService.findQuizDetailsByArticleId(articleId);
  }

  async findArticles(keywordId: bigint) {
    return this.articleService.findArticlePreviewsInAdmin(keywordId);
  }

  async updateKeyword(keywordId: bigint, updateKeywordDto: UpdateKeywordDto) {
    return this.keywordService.updateKeyword(keywordId, updateKeywordDto);
  }

  async getBatchJobState(jobId: string) {
    return this.batchService.getJobState(jobId);
  }

  async createArticle(keywordId: bigint) {
    return this.batchService.addBatchQueue(keywordId);
  }

  async updateArticle(articleId: bigint, updateArtilceDto: UpdateArticleDto) {
    await this.cacheService.invalidate(
      this.cacheService.generateCacheKey(CACHE_PREFIX.ARTICLE, { articleId }),
    );
    return this.articleService.updateArticle(articleId, updateArtilceDto);
  }

  async createVideo(keywordId: bigint, link: string) {
    return this.videoService.createVideo(keywordId, link);
  }

  async updateVideo(videoId: bigint, link: string) {
    return this.videoService.updateVideo(videoId, link);
  }

  async updateQuiz(
    quizId: bigint,
    updateQuizRequestDto: UpdateQuizRequestDto,
  ): Promise<QuizResponseDto> {
    return this.quizService.updateQuiz(quizId, updateQuizRequestDto);
  }
}
