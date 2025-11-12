/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PageResponse } from 'src/core/api-response/page-response';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { ArticleService } from '../article/article.service';
import { KeywordDetailResponseDto } from '../keyword/dto/keyword-detail-response.dto';
import { KeywordService } from '../keyword/keyword.service';
import { QuizResponseDto } from '../quiz/dto/quiz-response.dto';
import { QuizService } from '../quiz/quiz.service';
import { VideoService } from '../video/video.service';
import { AdminService } from './admin.service';
import { BatchService } from './batch.service';
import { BatchJobStateResponseDto } from './dto/batch-job-state-response.dto';

describe('AdminService', () => {
  let adminService: AdminService;
  let articleService: jest.Mocked<ArticleService>;
  let keywordService: jest.Mocked<KeywordService>;
  let videoService: jest.Mocked<VideoService>;
  let quizService: jest.Mocked<QuizService>;
  let batchService: jest.Mocked<BatchService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: ArticleService,
          useValue: {
            findArticlePreviewsInAdmin: jest.fn(),
            updateArticle: jest.fn(),
          },
        },
        {
          provide: KeywordService,
          useValue: {
            findKeywords: jest.fn(),
            updateKeyword: jest.fn(),
          },
        },
        {
          provide: VideoService,
          useValue: {
            createVideo: jest.fn(),
            updateVideo: jest.fn(),
          },
        },
        {
          provide: QuizService,
          useValue: {
            findQuizDetailsByArticleId: jest.fn(),
            updateQuiz: jest.fn(),
          },
        },
        {
          provide: BatchService,
          useValue: {
            getJobState: jest.fn(),
            addBatchQueue: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            invalidate: jest.fn(),
            generateCacheKey: jest.fn(),
          },
        },
      ],
    }).compile();

    adminService = module.get(AdminService);
    articleService = module.get(ArticleService);
    keywordService = module.get(KeywordService);
    videoService = module.get(VideoService);
    quizService = module.get(QuizService);
    batchService = module.get(BatchService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  describe('findKeywords', () => {
    it('should call keywordService.findKeywords with correct parameters', async () => {
      const query = 'test';
      const category = 'economy';
      const pageAble = {
        page: 1,
        size: 10,
        sort: 'id' as const,
        sortProp: 'id' as const,
        sortDirection: 'desc' as const,
      };
      const mockResult: PageResponse<KeywordDetailResponseDto> = {
        items: [],
        page: 1,
        size: 10,
        hasNext: false,
        totalElements: 0,
        totalPages: 0,
      };

      keywordService.findKeywords.mockResolvedValue(mockResult);

      const result = await adminService.findKeywords(query, category, pageAble);

      expect(keywordService.findKeywords).toHaveBeenCalledWith(
        query,
        category,
        pageAble,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('findQuizzes', () => {
    it('should call quizService.findQuizDetailsByArticleId with correct articleId', async () => {
      const articleId = 1n;
      const mockResult = [];

      quizService.findQuizDetailsByArticleId.mockResolvedValue(mockResult);

      const result = await adminService.findQuizzes(articleId);

      expect(quizService.findQuizDetailsByArticleId).toHaveBeenCalledWith(
        articleId,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('findArticles', () => {
    it('should call articleService.findArticlePreviewsInAdmin with correct keywordId', async () => {
      const keywordId = 1n;
      const mockResult = [];

      articleService.findArticlePreviewsInAdmin.mockResolvedValue(mockResult);

      const result = await adminService.findArticles(keywordId);

      expect(articleService.findArticlePreviewsInAdmin).toHaveBeenCalledWith(
        keywordId,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('updateKeyword', () => {
    it('should call keywordService.updateKeyword with correct parameters', async () => {
      const keywordId = 1n;
      const updateKeywordDto = {
        name: 'Updated Keyword',
        categoryName: 'Finance',
        description: 'Updated description',
      };
      const mockResult: KeywordDetailResponseDto = {
        id: keywordId,
        name: updateKeywordDto.name,
        category: { id: 1n, name: 'Finance' },
        video: null,
        description: updateKeywordDto.description,
        date: new Date(),
      };

      keywordService.updateKeyword.mockResolvedValue(mockResult);

      const result = await adminService.updateKeyword(
        keywordId,
        updateKeywordDto,
      );

      expect(keywordService.updateKeyword).toHaveBeenCalledWith(
        keywordId,
        updateKeywordDto,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('getBatchJobState', () => {
    it('should call batchService.getJobState with correct jobId', async () => {
      const jobId = 'job-123';
      const mockResult: BatchJobStateResponseDto = { state: 'completed' };

      batchService.getJobState.mockResolvedValue(mockResult);

      const result = await adminService.getBatchJobState(jobId);

      expect(batchService.getJobState).toHaveBeenCalledWith(jobId);
      expect(result).toBe(mockResult);
    });
  });

  describe('createArticle', () => {
    it('should call batchService.addBatchQueue with correct keywordId', async () => {
      const keywordId = 1n;
      const mockResult = { jobId: 'job-123' };

      batchService.addBatchQueue.mockResolvedValue(mockResult);

      const result = await adminService.createArticle(keywordId);

      expect(batchService.addBatchQueue).toHaveBeenCalledWith(keywordId);
      expect(result).toBe(mockResult);
    });
  });

  describe('updateArticle', () => {
    it('should invalidate cache and call articleService.updateArticle', async () => {
      const articleId = 1n;
      const updateArticleDto = { title: 'Updated Title' };
      const mockCacheKey = 'article:1';

      cacheService.generateCacheKey.mockReturnValue(mockCacheKey);
      cacheService.invalidate.mockResolvedValue(1);
      articleService.updateArticle.mockResolvedValue(undefined);

      const result = await adminService.updateArticle(
        articleId,
        updateArticleDto,
      );

      expect(cacheService.generateCacheKey).toHaveBeenCalledWith('article', {
        articleId,
      });
      expect(cacheService.invalidate).toHaveBeenCalledWith(mockCacheKey);
      expect(articleService.updateArticle).toHaveBeenCalledWith(
        articleId,
        updateArticleDto,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('createVideo', () => {
    it('should call videoService.createVideo with correct parameters', async () => {
      const keywordId = 1n;
      const link = 'https://youtube.com/watch?v=123';
      const mockResult = { id: 1n, keywordId, link };

      videoService.createVideo.mockResolvedValue(mockResult);

      const result = await adminService.createVideo(keywordId, link);

      expect(videoService.createVideo).toHaveBeenCalledWith(keywordId, link);
      expect(result).toBe(mockResult);
    });
  });

  describe('updateVideo', () => {
    it('should call videoService.updateVideo with correct parameters', async () => {
      const videoId = 1n;
      const link = 'https://youtube.com/watch?v=456';
      const mockResult = { id: videoId, link };

      videoService.updateVideo.mockResolvedValue(mockResult);

      const result = await adminService.updateVideo(videoId, link);

      expect(videoService.updateVideo).toHaveBeenCalledWith(videoId, link);
      expect(result).toBe(mockResult);
    });
  });

  describe('updateQuiz', () => {
    it('should call quizService.updateQuiz with correct parameters', async () => {
      const quizId = 1n;
      const updateQuizRequestDto = {
        description: 'Updated Question',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: 'Option 1',
        explanation: 'Explanation',
      };
      const mockResult: QuizResponseDto = {
        id: quizId,
        description: updateQuizRequestDto.description,
        question1: updateQuizRequestDto.question1,
        question2: updateQuizRequestDto.question2,
        question3: updateQuizRequestDto.question3,
        question4: updateQuizRequestDto.question4,
        answer: updateQuizRequestDto.answer,
        explanation: updateQuizRequestDto.explanation,
      };

      quizService.updateQuiz.mockResolvedValue(mockResult);

      const result = await adminService.updateQuiz(
        quizId,
        updateQuizRequestDto,
      );

      expect(quizService.updateQuiz).toHaveBeenCalledWith(
        quizId,
        updateQuizRequestDto,
      );
      expect(result).toBe(mockResult);
    });
  });
});
