import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateVideoRequestDto {
  @ApiProperty({ description: '영상 URL' })
  @IsUrl()
  videoUrl: string;
}
