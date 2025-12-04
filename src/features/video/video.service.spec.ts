/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_PREFIX } from 'src/core/constants/cache-prfix';
import { CommonException } from 'src/core/exception/common-exception';
import { CacheService } from 'src/core/infrastructure/io-redis/cache.service';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { VideoResponseDto } from './dto/video-response.dto';
import { VideoService } from './video.service';

describe('VideoService', () => {
  let service: VideoService;
  let prismaService: {
    video: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockPrisma = {
      video: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const mockCacheService = {
      withCaching: jest.fn(),
      generateCacheKey: jest.fn(),
      invalidateByPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
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

    service = module.get(VideoService);
    prismaService = module.get(PrismaService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByKeywordId', () => {
    const keywordId = BigInt(1);
    const mockVideo = {
      id: BigInt(1),
      keywordId: BigInt(1),
      link: 'https://youtube.com/watch?v=test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return video when found', async () => {
      const expectedCacheKey = 'video:1';
      cacheService.generateCacheKey.mockReturnValue(expectedCacheKey);
      cacheService.withCaching.mockResolvedValue(mockVideo);

      const result = await service.findByKeywordId(keywordId);

      expect(cacheService.generateCacheKey).toHaveBeenCalledWith(
        CACHE_PREFIX.VIDEO,
        { keywordId },
      );
      expect(cacheService.withCaching).toHaveBeenCalled();
      expect(result).toBeInstanceOf(VideoResponseDto);
    });

    it('should throw CommonException when video not found', async () => {
      const expectedCacheKey = 'video:1';
      cacheService.generateCacheKey.mockReturnValue(expectedCacheKey);
      cacheService.withCaching.mockResolvedValue(null);

      await expect(service.findByKeywordId(keywordId)).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('upsertFlag', () => {
    const memberId = BigInt(1);
    const keywordId = BigInt(1);

    it('should execute raw query to upsert study flag', async () => {
      prismaService.$queryRaw.mockResolvedValue(undefined);

      await service.upsertFlag(memberId, keywordId);

      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('createVideo', () => {
    const keywordId = BigInt(1);
    const link = 'https://youtube.com/watch?v=test';
    const mockCreatedVideo = {
      id: BigInt(1),
      keywordId,
      link,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new video and return VideoResponseDto', async () => {
      prismaService.video.create.mockResolvedValue(mockCreatedVideo);

      const result = await service.createVideo(keywordId, link);

      expect(prismaService.video.create).toHaveBeenCalledWith({
        data: {
          keywordId,
          link,
        },
      });
      expect(result).toBeInstanceOf(VideoResponseDto);
    });
  });

  describe('updateVideo', () => {
    const videoId = BigInt(1);
    const link = 'https://youtube.com/watch?v=updated';
    const mockUpdatedVideo = {
      id: videoId,
      keywordId: BigInt(1),
      link,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update video and return VideoResponseDto', async () => {
      prismaService.video.update.mockResolvedValue(mockUpdatedVideo);

      const result = await service.updateVideo(videoId, link);

      expect(prismaService.video.update).toHaveBeenCalledWith({
        data: {
          link,
        },
        where: {
          id: videoId,
        },
      });
      expect(result).toBeInstanceOf(VideoResponseDto);
    });
  });
});
