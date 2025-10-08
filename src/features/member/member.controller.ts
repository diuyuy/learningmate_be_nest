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
import { ApiResponse } from 'src/core/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { ParseNonNegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort-pipe';
import { ArticleScrapSortOption } from 'src/core/types/types';
import type { PageSortOption } from '../../core/types/types';
import { ArticleService } from '../article/article.service';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { StatisticService } from '../statistic/statistic.service';
import { StudyService } from '../study/study.service';
import { MemberUpdateRequestDto } from './dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly studyService: StudyService,
    private readonly statisticService: StatisticService,
    private readonly articleService: ArticleService,
  ) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get('me')
  async findMember(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const member = await this.memberService.findById(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      member,
    );
  }

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

  @Get('me/study-achivements')
  async getStudyAchivement(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const studyAchivement =
      await this.statisticService.getStudyAchivement(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      studyAchivement,
    );
  }

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

  @Get('me/quiz-statistics')
  async getQuizStatistics(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);

    const quizStats = await this.statisticService.getQuizStats(memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.OK),
      quizStats,
    );
  }

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
  ) {
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

  @Delete('me')
  async remove(@Req() req: RequestWithUser) {
    const memberId = BigInt(req.user.id);
    await this.memberService.removeMember(memberId);

    return ApiResponse.from(ResponseStatusFactory.create(ResponseCode.OK));
  }
}
