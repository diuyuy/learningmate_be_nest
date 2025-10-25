import { Injectable } from '@nestjs/common';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import { ArticleService } from '../article/article.service';
import { CreateArticleDto } from '../article/dto/create-article.dto';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { KeywordService } from '../keyword/keyword.service';
import { UpdateQuizRequestDto } from '../quiz/dto/update-quiz-request.dto';
import { QuizService } from '../quiz/quiz.service';
import { VideoService } from '../video/video.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly keywordService: KeywordService,
    private readonly videoService: VideoService,
    private readonly quizService: QuizService,
  ) {}

  async findKeywords(pageAble: Pageable<KeywordSortOption>) {
    return this.keywordService.findKeywords(pageAble);
  }

  async findQuizzes(articleId: bigint) {
    return this.quizService.findQuizDetailsByArticleId(articleId);
  }

  async createArticle(keywordId: bigint, createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(keywordId, createArticleDto);
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
