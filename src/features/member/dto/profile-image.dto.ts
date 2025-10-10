import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageDto {
  @ApiProperty({
    description: '이미지 데이터',
    type: 'string',
    format: 'binary',
  })
  image: any; // Resource equivalent in Node.js would be Buffer or ReadableStream

  @ApiProperty({
    description: '미디어 타입 (예: image/jpeg, image/png)',
    example: 'image/jpeg',
  })
  mediaType: string; // MediaType equivalent
}
