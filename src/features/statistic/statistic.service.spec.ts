import { Test, TestingModule } from '@nestjs/testing';
import { STUDY_FLAGS } from 'src/core/constants/study-flag';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { StatisticService } from './statistic.service';

describe('StatisticService', () => {
  let service: StatisticService;
  let prismaService: {
    study: {
      count: jest.Mock;
    };
    review: {
      count: jest.Mock;
    };
    memberQuiz: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    const mockPrisma = {
      study: {
        count: jest.fn(),
      },
      review: {
        count: jest.fn(),
      },
      memberQuiz: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get(StatisticService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudyAchivement', () => {
    const memberId = BigInt(1);

    it('should return study statistics successfully', async () => {
      // Given
      const studyCounts = 50;
      const reviewCounts = 30;
      const solvedQuizCounts = 45;
      const watchedVideoCounts = BigInt(40);

      prismaService.study.count.mockResolvedValue(studyCounts);
      prismaService.review.count.mockResolvedValue(reviewCounts);
      prismaService.memberQuiz.count.mockResolvedValue(solvedQuizCounts);
      prismaService.$queryRaw.mockResolvedValue([{ watchedVideoCounts }]);

      // When
      const result = await service.getStudyAchivement(memberId);

      // Then
      expect(result).toEqual({
        studyCounts,
        reviewCounts,
        solvedQuizCounts,
        watchedVideoCounts: Number(watchedVideoCounts),
      });

      expect(prismaService.study.count).toHaveBeenCalledWith({
        where: {
          memberId,
          studyStats: {
            gte: 1,
          },
        },
      });

      expect(prismaService.review.count).toHaveBeenCalledWith({
        where: {
          memberId,
        },
      });

      expect(prismaService.memberQuiz.count).toHaveBeenCalledWith({
        where: {
          memberId,
        },
      });

      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return successfully when all counts are 0', async () => {
      // Given
      prismaService.study.count.mockResolvedValue(0);
      prismaService.review.count.mockResolvedValue(0);
      prismaService.memberQuiz.count.mockResolvedValue(0);
      prismaService.$queryRaw.mockResolvedValue([
        { watchedVideoCounts: BigInt(0) },
      ]);

      // When
      const result = await service.getStudyAchivement(memberId);

      // Then
      expect(result).toEqual({
        studyCounts: 0,
        reviewCounts: 0,
        solvedQuizCounts: 0,
        watchedVideoCounts: 0,
      });
    });
  });

  describe('getStudyCategoryStats', () => {
    const memberId = BigInt(1);

    it('should return study statistics by category successfully', async () => {
      // Given
      const mockQueryResult = [
        { name: '금융', totalCounts: BigInt(5) },
        { name: '경제', totalCounts: BigInt(10) },
        { name: '경영', totalCounts: BigInt(3) },
        { name: null, totalCounts: BigInt(18) }, // ROLLUP total
      ];

      prismaService.$queryRaw.mockResolvedValue(mockQueryResult);

      // When
      const result = await service.getStudyCategoryStats(memberId);

      // Then
      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('finance');
      expect(result).toHaveProperty('economy');
      expect(result).toHaveProperty('management');
      expect(result).toHaveProperty('pub');
      expect(result).toHaveProperty('science');
      expect(result).toHaveProperty('society');
    });

    it('should return all categories as 0 when there are no study records', async () => {
      // Given
      prismaService.$queryRaw.mockResolvedValue([]);

      // When
      const result = await service.getStudyCategoryStats(memberId);

      // Then
      expect(result).toEqual({
        finance: 0,
        economy: 0,
        management: 0,
        pub: 0,
        science: 0,
        society: 0,
      });
    });
  });

  describe('getQuizStats', () => {
    const memberId = BigInt(1);

    it('should return quiz statistics successfully', async () => {
      // Given
      const mockAnswers = [
        { memberAnswer: 1, Quiz: { answer: 1 } }, // 정답
        { memberAnswer: 2, Quiz: { answer: 3 } }, // 오답
        { memberAnswer: 1, Quiz: { answer: 1 } }, // 정답
        { memberAnswer: 4, Quiz: { answer: 4 } }, // 정답
        { memberAnswer: 2, Quiz: { answer: 1 } }, // 오답
      ];

      prismaService.memberQuiz.findMany.mockResolvedValue(mockAnswers);

      // When
      const result = await service.getQuizStats(memberId);

      // Then
      expect(result).toEqual({
        correctCounts: 3,
        totalCounts: 5,
      });

      expect(prismaService.memberQuiz.findMany).toHaveBeenCalledWith({
        select: {
          memberAnswer: true,
          Quiz: {
            select: {
              answer: true,
            },
          },
        },
        where: {
          memberId,
        },
      });
    });

    it('should return 0 when no quiz has been solved', async () => {
      // Given
      prismaService.memberQuiz.findMany.mockResolvedValue([]);

      // When
      const result = await service.getQuizStats(memberId);

      // Then
      expect(result).toEqual({
        correctCounts: 0,
        totalCounts: 0,
      });
    });

    it('should have equal correctCounts and totalCounts when all answers are correct', async () => {
      // Given
      const mockAnswers = [
        { memberAnswer: 1, Quiz: { answer: 1 } },
        { memberAnswer: 2, Quiz: { answer: 2 } },
        { memberAnswer: 3, Quiz: { answer: 3 } },
      ];

      prismaService.memberQuiz.findMany.mockResolvedValue(mockAnswers);

      // When
      const result = await service.getQuizStats(memberId);

      // Then
      expect(result).toEqual({
        correctCounts: 3,
        totalCounts: 3,
      });
    });

    it('should have correctCounts as 0 when all answers are incorrect', async () => {
      // Given
      const mockAnswers = [
        { memberAnswer: 1, Quiz: { answer: 2 } },
        { memberAnswer: 2, Quiz: { answer: 3 } },
        { memberAnswer: 3, Quiz: { answer: 4 } },
      ];

      prismaService.memberQuiz.findMany.mockResolvedValue(mockAnswers);

      // When
      const result = await service.getQuizStats(memberId);

      // Then
      expect(result).toEqual({
        correctCounts: 0,
        totalCounts: 3,
      });
    });
  });

  describe('getMainStudyAchievements', () => {
    const memberId = BigInt(1);

    beforeEach(() => {
      // 날짜 고정 (2024-01-15)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return main page study achievements successfully', async () => {
      // Given
      const monthlyAttendanceDays = 15;
      const totalStudiedKeywords = 42;
      const totalReviews = 28;
      const mockMostStudied = [{ name: '경제', counts: BigInt(20) }];

      prismaService.study.count
        .mockResolvedValueOnce(monthlyAttendanceDays) // 월간 출석
        .mockResolvedValueOnce(totalStudiedKeywords); // 총 학습 키워드
      prismaService.$queryRaw.mockResolvedValue(mockMostStudied);
      prismaService.review.count.mockResolvedValue(totalReviews);

      // When
      const result = await service.getMainStudyAchievements(memberId);

      // Then
      expect(result).toEqual({
        monthlyAttendanceDays,
        totalStudiedKeywords,
        mostStudiedCategory: '경제',
        totalReviews,
      });

      // 첫 번째 study.count 호출 확인 (월간 출석)
      expect(prismaService.study.count).toHaveBeenNthCalledWith(1, {
        where: {
          memberId,
          createdAt: {
            gte: new Date(Date.UTC(2024, 0, 1, 0)), // 2024-01-01
            lt: new Date(Date.UTC(2024, 1, 1, 0)), // 2024-02-01
          },
        },
      });

      // 두 번째 study.count 호출 확인 (총 학습 키워드)
      expect(prismaService.study.count).toHaveBeenNthCalledWith(2, {
        where: {
          memberId,
          studyStats: STUDY_FLAGS.COMPLETE,
        },
      });

      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(prismaService.review.count).toHaveBeenCalledWith({
        where: {
          memberId,
        },
      });
    });

    it('should return null when there is no most studied category', async () => {
      // Given
      prismaService.study.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaService.$queryRaw.mockResolvedValue([]);
      prismaService.review.count.mockResolvedValue(0);

      // When
      const result = await service.getMainStudyAchievements(memberId);

      // Then
      expect(result).toEqual({
        monthlyAttendanceDays: 0,
        totalStudiedKeywords: 0,
        mostStudiedCategory: null,
        totalReviews: 0,
      });
    });

    it('should return the most studied category among multiple categories', async () => {
      // Given
      const mockMostStudied = [
        { name: '금융', counts: BigInt(50) }, // 가장 많음
      ];

      prismaService.study.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(100);
      prismaService.$queryRaw.mockResolvedValue(mockMostStudied);
      prismaService.review.count.mockResolvedValue(50);

      // When
      const result = await service.getMainStudyAchievements(memberId);

      // Then
      expect(result.mostStudiedCategory).toBe('금융');
    });
  });
});
