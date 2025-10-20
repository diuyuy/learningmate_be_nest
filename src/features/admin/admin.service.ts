import { Injectable } from '@nestjs/common';
import { KeywordSortOption, Pageable } from 'src/core/types/types';
import { ArticleService } from '../article/article.service';
import { CreateArticleDto } from '../article/dto/create-article.dto';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { KeywordService } from '../keyword/keyword.service';
import { VideoService } from '../video/video.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly keywordService: KeywordService,
    private readonly videoService: VideoService,
  ) {}

  async findKeywords(pageAble: Pageable<KeywordSortOption>) {
    return this.keywordService.findKeywords(pageAble);
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
}
