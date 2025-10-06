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
import type { RequestWithUser } from '../auth/types/request-with-user';
import { ReviewService } from '../review/review.service';
import { StudyService } from '../study/study.service';
import { MemberUpdateRequestDto } from './dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly studyService: StudyService,
    private readonly reviewService: ReviewService,
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
