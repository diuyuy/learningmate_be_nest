import { Injectable } from '@nestjs/common';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import { ArticleService } from '../article/article.service';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { UpdateKeywordDto } from '../keyword/dto';
import { KeywordService } from '../keyword/keyword.service';
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
    return this.articleService.updateArticle(articleId, updateArtilceDto);
  }

  async createVideo(keywordId: bigint, link: string) {
    return this.videoService.createVideo(keywordId, link);
  }

  async updateVideo(videoId: bigint, link: string) {
    return this.videoService.updateVideo(videoId, link);
  }

  async updateQuiz(quizId: bigint, updateQuizRequestDto: UpdateQuizRequestDto) {
    return this.quizService.updateQuiz(quizId, updateQuizRequestDto);
  }
}
