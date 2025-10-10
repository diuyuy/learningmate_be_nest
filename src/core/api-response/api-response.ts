import { ApiProperty } from '@nestjs/swagger';
import { ResponseStatus } from './response-status';

export class ApiResponse<T> {
  @ApiProperty({ description: 'HTTP 상태 코드', example: 200 })
  readonly status: number;

  @ApiProperty({
    description: '응답 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  readonly message: string;

  @ApiProperty({ description: '응답 데이터', required: false })
  readonly result?: T;

  constructor({ status, message, result }: ApiResponse<T>) {
    this.status = status;
    this.message = message;
    this.result = result;
  }

  static from<T>(responseStatus: ResponseStatus, result?: T): ApiResponse<T> {
    return new ApiResponse({ ...responseStatus, result });
  }
}
