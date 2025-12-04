import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ReviewCreateRequestDto, ReviewUpdateRequestDto } from './dto';
import { ReviewRepository } from './review.repository';

describe('ReviewRepository', () => {
  let repository: ReviewRepository;
  let prismaService: {
    review: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    likeReview: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
  };

  const mockReview = {
    id: BigInt(1),
    memberId: BigInt(1),
    articleId: BigInt(1),
    content1: '테스트 리뷰 내용',
    content2: '',
    content3: '',
    createdAt: new Date('2024-01-01'),
    Article: {
      id: BigInt(1),
      keywordId: BigInt(1),
    },
  };

  beforeEach(async () => {
    const mockPrisma = {
      review: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      likeReview: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = moduleRef.get(ReviewRepository);
    prismaService = moduleRef.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a review and update Study statistics', async () => {
      const memberId = BigInt(1);
      const articleId = BigInt(1);
      const createDto: ReviewCreateRequestDto = {
        content1: '테스트 리뷰 내용',
      };

      prismaService.$transaction.mockImplementation(
        (callback) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          callback({
            review: { create: jest.fn().mockResolvedValue(mockReview) },
            $queryRaw: jest.fn().mockResolvedValue(undefined),
          }) as unknown,
      );

      const result = await repository.create(memberId, articleId, createDto);

      expect(prismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe('findById', () => {
    it('should find a review by review ID', async () => {
      const reviewId = BigInt(1);
      const expectedResult = {
        id: reviewId,
        memberId: BigInt(1),
      };

      prismaService.review.findUnique.mockResolvedValue(expectedResult);

      const result = await repository.findById(reviewId);

      expect(prismaService.review.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          memberId: true,
        },
        where: {
          id: reviewId,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return null when review ID does not exist', async () => {
      const reviewId = BigInt(999);

      prismaService.review.findUnique.mockResolvedValue(null);

      const result = await repository.findById(reviewId);

      expect(result).toBeNull();
    });
  });

  describe('findByMemberAndArticle', () => {
    it('should find a review by member ID and article ID', async () => {
      const memberId = BigInt(1);
      const articleId = BigInt(1);

      prismaService.review.findUnique.mockResolvedValue(mockReview);

      const result = await repository.findByMemberAndArticle(
        memberId,
        articleId,
      );

      expect(prismaService.review.findUnique).toHaveBeenCalledWith({
        select: repository['reviewSelect'],
        where: {
          memberId_articleId: {
            articleId,
            memberId,
          },
        },
      });
      expect(result).toEqual(mockReview);
    });

    it('should return null when member and article combination does not exist', async () => {
      const memberId = BigInt(999);
      const articleId = BigInt(999);

      prismaService.review.findUnique.mockResolvedValue(null);

      const result = await repository.findByMemberAndArticle(
        memberId,
        articleId,
      );

      expect(result).toBeNull();
    });
  });

  describe('existsByMemberAndArticle', () => {
    it('should return true when review exists', async () => {
      const memberId = BigInt(1);
      const articleId = BigInt(1);

      prismaService.review.findUnique.mockResolvedValue({ id: BigInt(1) });

      const result = await repository.existsByMemberAndArticle(
        memberId,
        articleId,
      );

      expect(prismaService.review.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
        },
        where: {
          memberId_articleId: {
            memberId,
            articleId,
          },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when review does not exist', async () => {
      const memberId = BigInt(999);
      const articleId = BigInt(999);

      prismaService.review.findUnique.mockResolvedValue(null);

      const result = await repository.existsByMemberAndArticle(
        memberId,
        articleId,
      );

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const reviewId = BigInt(1);
      const updateDto: ReviewUpdateRequestDto = {
        content1: '수정된 리뷰 내용',
      };
      const updatedReview = {
        ...mockReview,
        content1: updateDto.content1,
      };

      prismaService.review.update.mockResolvedValue(updatedReview);

      const result = await repository.update(reviewId, updateDto);

      expect(prismaService.review.update).toHaveBeenCalledWith({
        data: updateDto,
        select: repository['reviewSelect'],
        where: {
          id: reviewId,
        },
      });
      expect(result).toEqual(updatedReview);
    });
  });

  describe('delete', () => {
    it('should delete a review', async () => {
      const reviewId = BigInt(1);

      prismaService.review.delete.mockResolvedValue(undefined);

      await repository.delete(reviewId);

      expect(prismaService.review.delete).toHaveBeenCalledWith({
        where: {
          id: reviewId,
        },
      });
    });
  });

  describe('likeReview', () => {
    it('should add a like to a review', async () => {
      const memberId = BigInt(1);
      const reviewId = BigInt(1);

      prismaService.likeReview.upsert.mockResolvedValue(undefined);

      await repository.likeReview(memberId, reviewId);

      expect(prismaService.likeReview.upsert).toHaveBeenCalledWith({
        where: {
          reviewId_memberId: {
            memberId,
            reviewId,
          },
        },
        update: {},
        create: {
          reviewId,
          memberId,
        },
      });
    });
  });

  describe('unlikeReview', () => {
    it('should remove a like from a review', async () => {
      const memberId = BigInt(1);
      const reviewId = BigInt(1);

      prismaService.likeReview.deleteMany.mockResolvedValue({ count: 1 });

      await repository.unlikeReview(memberId, reviewId);

      expect(prismaService.likeReview.deleteMany).toHaveBeenCalledWith({
        where: {
          memberId,
          reviewId,
        },
      });
    });
  });

  describe('getLikeCount', () => {
    it('should get the like count of a review', async () => {
      const reviewId = BigInt(1);
      const likeCount = 5;

      prismaService.likeReview.count.mockResolvedValue(likeCount);

      const result = await repository.getLikeCount(reviewId);

      expect(prismaService.likeReview.count).toHaveBeenCalledWith({
        where: {
          reviewId,
        },
      });

      expect(result).toBe(likeCount);
    });

    it('should return 0 when there are no likes', async () => {
      const reviewId = BigInt(1);

      prismaService.likeReview.count.mockResolvedValue(0);

      const result = await repository.getLikeCount(reviewId);

      expect(result).toBe(0);
    });
  });
});
