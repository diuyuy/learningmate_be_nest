import { MemberResponseDto } from '../../member/dto/member-response.dto';

export class LoginResultDto {
  accessToken: string;
  refreshToken: string;
  memberResponse: MemberResponseDto;
}
