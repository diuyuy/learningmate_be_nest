import { ApiProperty } from '@nestjs/swagger';
import { JobState } from 'bullmq';

export class BatchJobStateResponseDto {
  @ApiProperty({
    description: 'The current state of the batch job',
    enum: [
      'completed',
      'failed',
      'delayed',
      'active',
      'waiting',
      'waiting-children',
      'prioritized',
      'paused',
      'repeat',
      'unknown',
    ],
    example: 'completed',
  })
  state: JobState | 'unknown';

  constructor(jobState: JobState | 'unknown') {
    this.state = jobState;
  }

  static from(jobState: JobState | 'unknown') {
    return new BatchJobStateResponseDto(jobState);
  }
}
