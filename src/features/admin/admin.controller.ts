import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
import { ParseNonNegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int-pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort-pipe';
import type { PageSortOption } from 'src/core/types/types';
import { KeywordSortOption } from 'src/core/types/types';
import { Roles } from '../auth/decorators/roles';
import { RoleGuard } from '../auth/guards/role.guard';
import { KeywordDetailResponseDto } from '../keyword/dto/keyword-detail-response.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiExtraModels(KeywordDetailResponseDto)
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
}
