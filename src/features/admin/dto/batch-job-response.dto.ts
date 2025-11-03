import { ApiProperty } from '@nestjs/swagger';

export class BatchJobResponseDto {
  @ApiProperty({
    description: '배치 작업 Job ID',
    type: String,
  })
  jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  static from(jobId: string) {
    return new BatchJobResponseDto(jobId);
  }
}
