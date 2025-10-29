import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
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
import { ParseNonNegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort-pipe';
import { ArticleScrapSortOption } from 'src/core/types/types';
import type {
  IncorrectQuizSortOption,
  PageSortOption,
} from '../../core/types/types';
import { ArticleService } from '../article/article.service';
import { ArticleResponseDto } from '../article/dto/article-response.dto';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { IncorrectQuizResponseDto } from '../quiz/dto/incorrect-quiz-response.dto';
import { QuizService } from '../quiz/quiz.service';
import { QuizStatsResponseDto } from '../statistic/dto/quiz-stats-response.dto';
import { StudyAchivementResponseDto } from '../statistic/dto/study-achivement-response.dto';
import { StatisticService } from '../statistic/statistic.service';
import { MyStudyResponseDto } from '../study/dto';
import { StudyService } from '../study/study.service';
import { MemberUpdateRequestDto } from './dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { MemberService } from './member.service';

@ApiTags('Member')
@ApiExtraModels(
  ApiResponse,
  PageResponse,
  MyStudyResponseDto,
  StudyAchivementResponseDto,
  ArticleResponseDto,
  MemberResponseDto,
  QuizStatsResponseDto,
  IncorrectQuizResponseDto,
)
@Controller('v1/members')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly studyService: StudyService,
    private readonly statisticService: StatisticService,
    private readonly articleService: ArticleService,
    private readonly quizService: QuizService,
  ) {}

  @ApiOperation({
    summary: '회원 생성',
    description: '새로운 회원을 생성합니다.',
  })
  @ApiBody({ type: CreateMemberDto })
  @ApiResponseDecorator({
    status: 201,
    description: '회원 생성 완료',
    schema: {
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: '회원 생성 완료' },
      },
    },
  })
  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 회원의 정보를 조회합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '회원 정보 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MemberResponseDto),
            },
          },
        },
      ],
    },
  })
  @Get('me')
  async findMember(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const member = await this.memberService.findById(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      member,
    );
  }

  @ApiOperation({
    summary: '내 학습 상태 조회',
    description: '특정 년도와 월의 학습 상태를 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 연도',
    example: 2025,
    type: 'integer',
  })
  @ApiQuery({
    name: 'month',
    description: '조회할 월 (1-12)',
    example: 1,
    type: 'integer',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '학습 상태 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MyStudyResponseDto),
            },
          },
        },
      ],
    },
  })
  @Get('me/study-status')
  async findMyStudyStatus(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    const studyStatus = await this.studyService.getStudyStatus({
      memberId,
      year,
      month,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      studyStatus,
    );
  }

  @ApiOperation({
    summary: '내 학습 성취도 조회',
    description: '회원의 학습 성취도를 조회합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '학습 성취도 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(StudyAchivementResponseDto),
            },
          },
        },
      ],
    },
  })
  @Get('me/study-achievements')
  async getStudyAchivement(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const studyAchivement =
      await this.statisticService.getStudyAchivement(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      studyAchivement,
    );
  }

  @ApiOperation({
    summary: '내 카테고리별 학습 통계 조회',
    description: '회원의 카테고리별 학습 통계를 조회합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '카테고리별 학습 통계 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'object',
              description: '카테고리별 학습 통계 정보',
            },
          },
        },
      ],
    },
  })
  @Get('me/study-category-statistics')
  async getStudyCatStats(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const studyCatStats =
      await this.statisticService.getStudyCategoryStats(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      studyCatStats,
    );
  }

  @ApiOperation({
    summary: '내 퀴즈 통계 조회',
    description: '회원의 퀴즈 통계를 조회합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '퀴즈 통계 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(QuizStatsResponseDto),
            },
          },
        },
      ],
    },
  })
  @Get('me/quiz-statistics')
  async getQuizStatistics(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const quizStats = await this.statisticService.getQuizStats(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quizStats,
    );
  }

  @ApiOperation({
    summary: '내 오답 퀴즈 목록 조회',
    description: '회원이 틀린 퀴즈 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (0부터 시작)',
    example: 0,
    type: 'integer',
  })
  @ApiQuery({
    name: 'size',
    description: '페이지당 항목 수',
    example: 10,
    type: 'integer',
  })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 ("createdAt"). 정렬 예시 ("createdAt,desc")',
    example: 'createdAt,desc',
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '오답 퀴즈 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              allOf: [
                { $ref: getSchemaPath(PageResponse) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: getSchemaPath(IncorrectQuizResponseDto) },
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
  @Get('me/incorrect-quizzes')
  async getIncorrectQuizzes(
    @Query('page', ParseNonNegativeIntPipe) page: number,
    @Query('size', ParseNonNegativeIntPipe) size: number,
    @Query(
      'sort',
      new ParsePageSortPipe<IncorrectQuizSortOption>(['createdAt']),
    )
    sort: PageSortOption<IncorrectQuizSortOption>,
    @Req() req: RequestWithUser,
  ) {
    const memberId = BigInt(req.user.id);

    const incorrectQuizzes = await this.quizService.findIncorrectQuizzes(
      memberId,
      {
        page,
        size,
        ...sort,
      },
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      incorrectQuizzes,
    );
  }

  @ApiOperation({
    summary: '내 스크랩한 기사 목록 조회',
    description: '회원이 스크랩한 기사 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (0부터 시작)',
    example: 0,
    type: 'integer',
  })
  @ApiQuery({
    name: 'size',
    description: '페이지당 항목 수',
    example: 10,
    type: 'integer',
  })
  @ApiQuery({
    name: 'sort',
    description: '정렬 옵션 (예: createdAt,desc). 정렬 예시 ("createdAt,desc")',
    example: 'createdAt,desc',
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: '스크랩한 기사 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              allOf: [
                { $ref: getSchemaPath(PageResponse) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: getSchemaPath(ArticleResponseDto) },
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
  @Get('me/article-scraps')
  async getArticleScraps(
    @Query('page', ParseNonNegativeIntPipe) page: number,
    @Query('size', ParseNonNegativeIntPipe) size: number,
    @Query(
      'sort',
      new ParsePageSortPipe<ArticleScrapSortOption>([
        'createdAt',
        'scrapCounts',
        'viewsCounts',
      ]),
    )
    sortOption: PageSortOption<ArticleScrapSortOption>,
    @Req()
    req: RequestWithUser,
  ): Promise<ApiResponse<PageResponse<ArticleResponseDto>>> {
    const memberId = BigInt(req.user.id);

    const pageArticles = await this.articleService.findArticleScraps(memberId, {
      page,
      size,
      ...sortOption,
    });

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      pageArticles,
    );
  }

  @ApiOperation({
    summary: '내 정보 수정',
    description: '현재 로그인한 회원의 정보를 수정합니다.',
  })
  @ApiBody({ type: MemberUpdateRequestDto })
  @ApiResponseDecorator({
    status: 200,
    description: '회원 정보 수정 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MemberResponseDto),
            },
          },
        },
      ],
    },
  })
  @Patch('me')
  async updateMember(
    @Req() req: RequestWithUser,
    @Body() memberUpdateRequestDto: MemberUpdateRequestDto,
  ) {
    const memberId = BigInt(req.user.id);

    const memberResponse = await this.memberService.updateMember(
      memberId,
      memberUpdateRequestDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      memberResponse,
    );
  }

  @ApiOperation({
    summary: '메인 화면 학습 성취도 조회',
    description: '메인 화면에 표시할 학습 성취도 데이터를 조회합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '메인 화면 학습 성취도 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              type: 'object',
              description: '메인 화면 학습 성취도 정보',
            },
          },
        },
      ],
    },
  })
  @Get('me/main-study-achievements')
  async getMainStudyAchievements(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const studyAchievements =
      await this.statisticService.getMainStudyAchievements(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      studyAchievements,
    );
  }

  @ApiOperation({
    summary: '프로필 이미지 업데이트',
    description:
      '회원의 프로필 이미지를 업데이트합니다. (최대 5MB, jpg/jpeg/png/gif/webp)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '프로필 이미지 파일',
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 200,
    description: '프로필 이미지 업데이트 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MemberResponseDto),
            },
          },
        },
      ],
    },
  })
  @Patch('me/profile-images')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    const memberId = BigInt(req.user.id);
    const member = await this.memberService.updateProfileImage(memberId, image);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      member,
    );
  }

  @ApiOperation({
    summary: '회원 탈퇴',
    description: '현재 로그인한 회원을 삭제합니다.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: '회원 탈퇴 성공',
    schema: {
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @Delete('me')
  async remove(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);
    await this.memberService.removeMember(memberId);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
