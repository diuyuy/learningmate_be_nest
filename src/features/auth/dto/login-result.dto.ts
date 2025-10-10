import { ApiProperty } from '@nestjs/swagger';
import { MemberResponseDto } from '../../member/dto/member-response.dto';

export class LoginResultDto {
  @ApiProperty({
    description: '액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: '회원 정보',
    type: () => MemberResponseDto,
  })
  memberResponse: MemberResponseDto;
}
