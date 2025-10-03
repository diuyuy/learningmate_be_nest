import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { ReviewService } from '../review/review.service';
import { StudyService } from '../study/study.service';
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.memberService.remove(+id);
  // }
}
