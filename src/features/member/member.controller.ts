import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.memberService.remove(+id);
  // }
}
