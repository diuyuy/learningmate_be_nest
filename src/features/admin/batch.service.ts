import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { BATCH_OPTIONS } from 'src/core/constants/batch-options';
import { CommonException } from 'src/core/exception/common-exception';
import { BatchJobResponseDto } from './dto/batch-job-response.dto';
import { BatchJobStateResponseDto } from './dto/batch-job-state-response.dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectQueue(BATCH_OPTIONS.QUEUE_NAME) private readonly batchQueue: Queue,
  ) {}

  async addBatchQueue(keywordId: bigint): Promise<BatchJobResponseDto> {
    const { id } = await this.batchQueue.add(BATCH_OPTIONS.JOB_NAME, {
      keywordId: String(keywordId),
    });

    if (!id) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.CREATE_JOB_FAIL),
      );
    }

    return BatchJobResponseDto.from(id);
  }

  async getJobState(jobId: string): Promise<BatchJobStateResponseDto> {
    const job = await this.batchQueue.getJob(jobId);

    if (!job)
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.JOB_NOT_FOUND),
      );

    const jobState = await job.getState();

    return BatchJobStateResponseDto.from(jobState);
  }
}
