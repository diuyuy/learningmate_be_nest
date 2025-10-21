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
import { CreateArticleDto } from '../article/dto/create-article.dto';
import { UpdateArticleDto } from '../article/dto/update-article.dto';
import { Roles } from '../auth/decorators/roles';
import { RoleGuard } from '../auth/guards/role.guard';
import { KeywordDetailResponseDto } from '../keyword/dto/keyword-detail-response.dto';
import { CreateVideoRequestDto } from '../video/dto/create-video-request.dto';
import { UpdateVideoRequestDto } from '../video/dto/update-video-request.dto';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiExtraModels(KeywordDetailResponseDto, VideoResponseDto, ArticleResponseDto)
@Roles(['admin'])
@UseGuards(RoleGuard)
@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: '키워드 페이지네이션 조회',
  })
  @ApiQuery({ name: 'page', description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'size', description: '페이지 크기', type: Number })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 ("id", "name")',
    type: Number,
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
    @Query('page', ParseNonNegativeIntPipe) page: number,
    @Query('size', ParseNonNegativeIntPipe) size: number,
    @Query('sort', new ParsePageSortPipe<KeywordSortOption>(['id', 'name']))
    sortOptions: PageSortOption<KeywordSortOption>,
  ) {
    const keywords = await this.adminService.findKeywords({
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
  @Post('keywords/:keywordId/video-urls')
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
              $ref: getSchemaPath(ArticleResponseDto),
            },
          },
        },
      ],
    },
  })
  @Post('keywords/:keywordId/articles')
  async createArtileOfKeyword(
    @Param('keywordId', ParseBigIntPipe) keywordId: bigint,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    const article = await this.adminService.createArticle(
      keywordId,
      createArticleDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      article,
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
}
