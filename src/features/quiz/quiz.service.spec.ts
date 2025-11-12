/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;
  let prismaService: {
    quiz: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    memberQuiz: {
      upsert: jest.Mock;
      count: jest.Mock;
    };
    $queryRaw: jest.Mock;
    $transaction: jest.Mock;
  };
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockPrisma = {
      quiz: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      memberQuiz: {
        upsert: jest.fn(),
        count: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
    };

    const mockCacheService = {
      withCaching: jest.fn(),
      generateCacheKey: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = moduleRef.get(QuizService);
    prismaService = moduleRef.get(PrismaService);
    cacheService = moduleRef.get(CacheService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findManyByArticleId', () => {
    it('should return quiz list by article id', async () => {
      const articleId = 1n;
      const mockQuizzes = [
        {
          id: 1n,
          description: 'Test quiz 1',
          question1: 'Option 1',
          question2: 'Option 2',
          question3: 'Option 3',
          question4: 'Option 4',
          answer: '1',
          explanation: 'Test explanation',
          articleId: 1n,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2n,
          description: 'Test quiz 2',
          question1: 'Option 1',
          question2: 'Option 2',
          question3: 'Option 3',
          question4: 'Option 4',
          answer: '2',
          explanation: 'Test explanation 2',
          articleId: 1n,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      cacheService.generateCacheKey.mockReturnValue('quiz:articleId:1');
      cacheService.withCaching.mockResolvedValue(mockQuizzes);

      const result = await service.findManyByArticleId(articleId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1n,
          description: 'Test quiz 1',
          question1: 'Option 1',
        }),
      );
      expect(cacheService.withCaching).toHaveBeenCalledTimes(1);
    });
  });

  describe('findQuizDetailsByArticleId', () => {
    it('should return quiz details by article id', async () => {
      const articleId = 1n;
      const mockQuizzes = [
        {
          id: 1n,
          description: 'Test quiz 1',
          question1: 'Option 1',
          question2: 'Option 2',
          question3: 'Option 3',
          question4: 'Option 4',
          answer: '1',
          explanation: 'Test explanation',
          articleId: 1n,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.quiz.findMany.mockResolvedValue(mockQuizzes);

      const result = await service.findQuizDetailsByArticleId(articleId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1n,
          description: 'Test quiz 1',
          question1: 'Option 1',
          question2: 'Option 2',
          question3: 'Option 3',
          question4: 'Option 4',
          answer: '1',
          explanation: 'Test explanation',
        }),
      );
      expect(prismaService.quiz.findMany).toHaveBeenCalledWith({
        where: { articleId },
      });
    });
  });

  describe('findIncorrectQuizzes', () => {
    it('should return incorrect quizzes with pagination', async () => {
      const memberId = 1n;
      const pageAble = {
        page: 0,
        size: 10,
        sortProp: 'createdAt' as const,
        sortDirection: 'desc' as const,
      };

      const mockIncorrectQuizzes = [
        {
          id: 1n,
          description: 'Test quiz',
          explanation: 'Test explanation',
          answer: '1',
          memberAnswer: '2',
          answerCreatedAt: new Date(),
          articleId: 1n,
          title: 'Test article',
          question1: 'Option 1',
          question2: 'Option 2',
          question3: 'Option 3',
          question4: 'Option 4',
          keywordId: 1n,
          keywordName: 'Test keyword',
          keywordDescription: 'Test keyword description',
          date: new Date(),
        },
      ];

      const mockCount = [{ counts: 1n }];

      prismaService.$queryRaw
        .mockResolvedValueOnce(mockIncorrectQuizzes)
        .mockResolvedValueOnce(mockCount);

      const result = await service.findIncorrectQuizzes(memberId, pageAble);

      expect(result.items).toHaveLength(1);
      expect(result.totalElements).toBe(1);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          id: 1n,
          description: 'Test quiz',
          answer: '1',
          memberAnswer: '2',
        }),
      );
    });
  });

  describe('updateQuiz', () => {
    it('should update quiz successfully', async () => {
      const quizId = 1n;
      const updateDto = {
        description: 'Updated description',
        answer: '2',
      };

      const mockUpdatedQuiz = {
        id: quizId,
        description: 'Updated description',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: '2',
        explanation: 'Test explanation',
        articleId: 1n,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.quiz.update.mockResolvedValue(mockUpdatedQuiz);

      const result = await service.updateQuiz(quizId, updateDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: quizId,
          description: 'Updated description',
          answer: '2',
        }),
      );
      expect(prismaService.quiz.update).toHaveBeenCalledWith({
        data: updateDto,
        where: { id: quizId },
      });
    });
  });

  describe('solveQuiz', () => {
    const memberId = 1n;
    const articleId = 1n;
    const quizId = 1n;
    const memberQuizRequest = { memberAnswer: '1' };

    it('should solve quiz correctly and return graded result (correct answer, less than 5 quizzes)', async () => {
      const mockQuiz = {
        id: quizId,
        description: 'Test quiz',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: '1',
        explanation: 'Test explanation',
        article: {
          id: articleId,
          keywordId: 1n,
        },
      };

      const mockTransaction = jest.fn((callback): unknown => {
        const mockPrisma = {
          quiz: {
            findUnique: jest.fn().mockResolvedValue(mockQuiz),
          },
          memberQuiz: {
            upsert: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(3),
          },
          $queryRaw: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return callback(mockPrisma) as unknown;
      });

      prismaService.$transaction = mockTransaction;

      const result = await service.solveQuiz({
        memberId,
        articleId,
        quizId,
        memberQuizRequest,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: quizId,
          answer: '1',
          explanation: 'Test explanation',
          status: '정답',
        }),
      );
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should solve quiz correctly and update study stats when 5 or more quizzes solved', async () => {
      const mockQuiz = {
        id: quizId,
        description: 'Test quiz',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: '1',
        explanation: 'Test explanation',
        article: {
          id: articleId,
          keywordId: 1n,
        },
      };

      const mockTransaction = jest.fn((callback) => {
        const mockPrisma = {
          quiz: {
            findUnique: jest.fn().mockResolvedValue(mockQuiz),
          },
          memberQuiz: {
            upsert: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(5),
          },
          $queryRaw: jest.fn().mockResolvedValue(undefined),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return callback(mockPrisma) as unknown;
      });

      prismaService.$transaction = mockTransaction;

      const result = await service.solveQuiz({
        memberId,
        articleId,
        quizId,
        memberQuizRequest,
      });

      expect(result).toEqual(
        expect.objectContaining({
          status: '정답',
        }),
      );
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should solve quiz incorrectly and return graded result (wrong answer)', async () => {
      const wrongAnswerRequest = { memberAnswer: '2' };
      const mockQuiz = {
        id: quizId,
        description: 'Test quiz',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: '1',
        explanation: 'Test explanation',
        article: {
          id: articleId,
          keywordId: 1n,
        },
      };

      const mockTransaction = jest.fn((callback) => {
        const mockPrisma = {
          quiz: {
            findUnique: jest.fn().mockResolvedValue(mockQuiz),
          },
          memberQuiz: {
            upsert: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(3),
          },
          $queryRaw: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return callback(mockPrisma) as unknown;
      });

      prismaService.$transaction = mockTransaction;

      const result = await service.solveQuiz({
        memberId,
        articleId,
        quizId,
        memberQuizRequest: wrongAnswerRequest,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: quizId,
          answer: '2',
          explanation: undefined,
          status: '오답',
        }),
      );
    });

    it('should throw exception when quiz not found', async () => {
      const mockTransaction = jest.fn((callback) => {
        const mockPrisma = {
          quiz: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          memberQuiz: {
            upsert: jest.fn(),
            count: jest.fn(),
          },
          $queryRaw: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return callback(mockPrisma) as unknown;
      });

      prismaService.$transaction = mockTransaction;

      await expect(
        service.solveQuiz({
          memberId,
          articleId,
          quizId,
          memberQuizRequest,
        }),
      ).rejects.toThrow();
    });

    it('should throw exception when article id does not match', async () => {
      const mockQuiz = {
        id: quizId,
        description: 'Test quiz',
        question1: 'Option 1',
        question2: 'Option 2',
        question3: 'Option 3',
        question4: 'Option 4',
        answer: '1',
        explanation: 'Test explanation',
        article: {
          id: 999n,
          keywordId: 1n,
        },
      };

      const mockTransaction = jest.fn((callback) => {
        const mockPrisma = {
          quiz: {
            findUnique: jest.fn().mockResolvedValue(mockQuiz),
          },
          memberQuiz: {
            upsert: jest.fn(),
            count: jest.fn(),
          },
          $queryRaw: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return callback(mockPrisma) as unknown;
      });

      prismaService.$transaction = mockTransaction;

      await expect(
        service.solveQuiz({
          memberId,
          articleId,
          quizId,
          memberQuizRequest,
        }),
      ).rejects.toThrow();
    });
  });
});
