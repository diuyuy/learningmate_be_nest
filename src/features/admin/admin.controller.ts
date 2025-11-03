import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/core/api-response/api-response';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { ParseBigIntPipe } from 'src/core/pipes/parse-bigint-pipe';
import { ParseNonNegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort-pipe';
import type { PageSortOption } from 'src/core/types/types';
import { KeywordSortOption } from 'src/core/types/types';
import { ArticleResponseDto } from '../article/dto/article-response.dto';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { Roles } from '../auth/decorators/roles';
import { RoleGuard } from '../auth/guards/role.guard';
import { KeywordDetailResponseDto } from '../keyword/dto/keyword-detail-response.dto';
import { QuizResponseDto } from '../quiz/dto/quiz-response.dto';
import { UpdateQuizRequestDto } from '../quiz/dto/update-quiz-request.dto';
import { CreateVideoRequestDto } from '../video/dto/create-video-request.dto';
import { UpdateVideoRequestDto } from '../video/dto/update-video-request.dto';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { AdminService } from './admin.service';
import { BatchJobResponseDto } from './dto/batch-job-response.dto';
import { BatchJobStateResponseDto } from './dto/batch-job-state-response.dto';

@ApiTags('Admin')
@ApiExtraModels(
  KeywordDetailResponseDto,
  VideoResponseDto,
  ArticleResponseDto,
  QuizResponseDto,
  BatchJobResponseDto,
  BatchJobStateResponseDto,
)
@Roles(['admin'])
@UseGuards(RoleGuard)
@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: '키워드 페이지네이션 조회',
  })
  @ApiQuery({
    name: 'query',
    description: '페이지 번호',
    type: String,
    required: false,
  })
  @ApiQuery({ name: 'page', description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'size', description: '페이지 크기', type: Number })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 ("id", "name"). 정렬 예시 ("createdAt,desc")',
    type: String,
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '키워드 조회 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              allOf: [
                {
                  $ref: getSchemaPath(PageResponse),
                },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(KeywordDetailResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
  @Get('keywords')
  async findKeywords(
    @Query('query') query: string = '',
    @Query('page', ParseNonNegativeIntPipe) page: number,
    @Query('size', ParseNonNegativeIntPipe) size: number,
    @Query('sort', new ParsePageSortPipe<KeywordSortOption>(['id', 'name']))
    sortOptions: PageSortOption<KeywordSortOption>,
  ) {
    const keywords = await this.adminService.findKeywords(query, {
      page,
      size,
      ...sortOptions,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      keywords,
    );
  }

  @ApiOperation({
    summary: '기사의 퀴즈 목록 조회',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '퀴즈 목록 조회 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              type: 'array',
              items: {
                $ref: getSchemaPath(QuizResponseDto),
              },
            },
          },
        },
      ],
    },
  })
  @Get('articles/:articleId/quizzes')
  async findQuizzsByArticleId(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
  ) {
    const quizzes = await this.adminService.findQuizzes(articleId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quizzes,
    );
  }

  @ApiOperation({
    summary: '배치 작업 상태 조회',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '배치 작업 상태 조회 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(BatchJobStateResponseDto),
            },
          },
        },
      ],
    },
  })
  @Get('batch-jobs/:jobId')
  async getBatchJobState(@Param('jobId') jobId: string) {
    const jobState = await this.adminService.getBatchJobState(jobId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      jobState,
    );
  }

  @ApiOperation({
    summary: '키워드에 영상 추가',
  })
  @ApiResponseDecorator({
    status: 201,
    description: '영상 생성 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(VideoResponseDto),
            },
          },
        },
      ],
    },
  })
  @Post('keywords/:keywordId/videos')
  async createVideoOfKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
    @Body() createVideoDto: CreateVideoRequestDto,
  ) {
    const video = await this.adminService.createVideo(
      keywordId,
      createVideoDto.videoUrl,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      video,
    );
  }

  @ApiOperation({
    summary: '영상 수정',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '영상 수정 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(VideoResponseDto),
            },
          },
        },
      ],
    },
  })
  @Patch('videos/:videoId')
  async updateVideo(
    @Param('videoId', ParseBigIntPipe) videoId: bigint,
    @Body() updateVideoDto: UpdateVideoRequestDto,
  ) {
    const video = await this.adminService.updateVideo(
      videoId,
      updateVideoDto.videoUrl,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      video,
    );
  }

  @ApiOperation({
    summary: '키워드에 기사 추가',
  })
  @ApiResponseDecorator({
    status: 201,
    description: '기사 생성 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(BatchJobResponseDto),
            },
          },
        },
      ],
    },
  })
  @Post('keywords/:keywordId/articles')
  async createArtileOfKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
  ) {
    const job = await this.adminService.createArticle(keywordId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      job,
    );
  }

  @ApiOperation({
    summary: '기사 수정',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '기사 수정 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(ArticleResponseDto),
            },
          },
        },
      ],
    },
  })
  @Patch('articles/:articleId')
  async updateArticle(
    @Param('articleId', ParseBigIntPipe) articleId: bigint,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.adminService.updateArticle(
      articleId,
      updateArticleDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      article,
    );
  }

  @ApiOperation({
    summary: '퀴즈 수정',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '퀴즈 수정 성공',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApiResponse),
        },
        {
          properties: {
            result: {
              $ref: getSchemaPath(QuizResponseDto),
            },
          },
        },
      ],
    },
  })
  @Patch('quizzes/:quizId')
  async updateQuiz(
    @Param('quizId', ParseBigIntPipe) quizId: bigint,
    @Body() updateQuizRequestDto: UpdateQuizRequestDto,
  ) {
    const quiz = await this.adminService.updateQuiz(
      quizId,
      updateQuizRequestDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quiz,
    );
  }
}
