import { Test, TestingModule } from '@nestjs/testing';
import { Study } from 'generated/prisma';
import { CommonException } from 'src/core/exception/common-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { StudyService } from './study.service';

describe('StudyService', () => {
  let service: StudyService;
  let prismaService: {
    study: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    const mockPrisma = {
      study: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get(StudyService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudyStatus', () => {
    const memberId = BigInt(1);
    const year = 2025;
    const month = 1;

    it('should return study status for a given member and time period', async () => {
      const mockStudies: Study[] = [
        {
          id: BigInt(1),
          memberId: BigInt(1),
          keywordId: BigInt(1),
          studyStats: 7, // VIDEO | REVIEW | QUIZ
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
        {
          id: BigInt(2),
          memberId: BigInt(1),
          keywordId: BigInt(2),
          studyStats: 4, // VIDEO only
          createdAt: new Date('2025-01-20'),
          updatedAt: new Date('2025-01-20'),
        },
      ];

      prismaService.study.findMany.mockResolvedValue(mockStudies);

      const result = await service.getStudyStatus({ memberId, year, month });

      expect(prismaService.study.findMany).toHaveBeenCalledWith({
        where: {
          memberId,
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: BigInt(1),
        keywordId: BigInt(1),
        studyStats: 7,
        studyStatusCount: 3,
        videoCompleted: true,
        quizCompleted: true,
        reviewCompleted: true,
      });

      expect(result[1]).toMatchObject({
        id: BigInt(2),
        keywordId: BigInt(2),
        studyStats: 4,
        studyStatusCount: 1,
        videoCompleted: true,
        quizCompleted: false,
        reviewCompleted: false,
      });
    });

    it('should return empty array when no study records exist', async () => {
      prismaService.study.findMany.mockResolvedValue([]);

      const result = await service.getStudyStatus({ memberId, year, month });

      expect(result).toEqual([]);
      expect(prismaService.study.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle study with null studyStats', async () => {
      const mockStudy = [
        {
          id: BigInt(1),
          memberId: BigInt(1),
          keywordId: BigInt(1),
          studyStats: null as number | null,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
      ] as Study[];

      prismaService.study.findMany.mockResolvedValue(mockStudy);

      const result = await service.getStudyStatus({ memberId, year, month });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        studyStats: 0,
        studyStatusCount: 0,
        videoCompleted: false,
        quizCompleted: false,
        reviewCompleted: false,
      });
    });

    it('should throw CommonException when month is less than 1', async () => {
      await expect(
        service.getStudyStatus({ memberId, year, month: 0 }),
      ).rejects.toThrow(CommonException);

      await expect(
        service.getStudyStatus({ memberId, year, month: 0 }),
      ).rejects.toMatchObject({
        response: {
          status: 400,
          message: '유효하지 않은 달 입니다.',
        },
      });

      expect(prismaService.study.findMany).not.toHaveBeenCalled();
    });

    it('should throw CommonException when month is greater than 12', async () => {
      await expect(
        service.getStudyStatus({ memberId, year, month: 13 }),
      ).rejects.toThrow(CommonException);

      await expect(
        service.getStudyStatus({ memberId, year, month: 13 }),
      ).rejects.toMatchObject({
        response: {
          status: 400,
          message: '유효하지 않은 달 입니다.',
        },
      });

      expect(prismaService.study.findMany).not.toHaveBeenCalled();
    });

    it('should correctly calculate date range for december', async () => {
      prismaService.study.findMany.mockResolvedValue([]);

      await service.getStudyStatus({ memberId, year: 2024, month: 12 });

      expect(prismaService.study.findMany).toHaveBeenCalledWith({
        where: {
          memberId,
          createdAt: {
            gte: new Date(2024, 11, 1), // December 1st
            lt: new Date(2025, 0, 1), // January 1st
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    });

    it('should map different studyStats bit flags correctly', async () => {
      const mockStudies: Study[] = [
        {
          id: BigInt(1),
          memberId: BigInt(1),
          keywordId: BigInt(1),
          studyStats: 1, // QUIZ only
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
        {
          id: BigInt(2),
          memberId: BigInt(1),
          keywordId: BigInt(2),
          studyStats: 2, // REVIEW only
          createdAt: new Date('2025-01-16'),
          updatedAt: new Date('2025-01-16'),
        },
        {
          id: BigInt(3),
          memberId: BigInt(1),
          keywordId: BigInt(3),
          studyStats: 3, // QUIZ | REVIEW
          createdAt: new Date('2025-01-17'),
          updatedAt: new Date('2025-01-17'),
        },
      ];

      prismaService.study.findMany.mockResolvedValue(mockStudies);

      const result = await service.getStudyStatus({ memberId, year, month });

      expect(result[0]).toMatchObject({
        studyStats: 1,
        studyStatusCount: 1,
        videoCompleted: false,
        quizCompleted: true,
        reviewCompleted: false,
      });

      expect(result[1]).toMatchObject({
        studyStats: 2,
        studyStatusCount: 1,
        videoCompleted: false,
        quizCompleted: false,
        reviewCompleted: true,
      });

      expect(result[2]).toMatchObject({
        studyStats: 3,
        studyStatusCount: 2,
        videoCompleted: false,
        quizCompleted: true,
        reviewCompleted: true,
      });
    });

    it('should return studies ordered by createdAt in ascending order', async () => {
      const mockStudies: Study[] = [
        {
          id: BigInt(1),
          memberId: BigInt(1),
          keywordId: BigInt(1),
          studyStats: 1,
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-10'),
        },
        {
          id: BigInt(2),
          memberId: BigInt(1),
          keywordId: BigInt(2),
          studyStats: 2,
          createdAt: new Date('2025-01-20'),
          updatedAt: new Date('2025-01-20'),
        },
        {
          id: BigInt(3),
          memberId: BigInt(1),
          keywordId: BigInt(3),
          studyStats: 3,
          createdAt: new Date('2025-01-30'),
          updatedAt: new Date('2025-01-30'),
        },
      ];

      prismaService.study.findMany.mockResolvedValue(mockStudies);

      const result = await service.getStudyStatus({ memberId, year, month });

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(BigInt(1));
      expect(result[1].id).toBe(BigInt(2));
      expect(result[2].id).toBe(BigInt(3));
    });
  });
});
