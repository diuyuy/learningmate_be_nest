import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BATCH_OPTIONS } from 'src/core/constants/batch-options';

@Injectable()
export class BatchService {
  constructor(@InjectQueue('batch') private readonly batchQueue: Queue) {}

  async addBatchQueue(keywordId: bigint) {
    await this.batchQueue.add(
      BATCH_OPTIONS.JOB_NAME,
      {
        keywordId: String(keywordId),
      },
      {
        jobId: BATCH_OPTIONS.JOB_NAME,
      },
    );
  }
}
