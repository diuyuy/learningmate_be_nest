import { Module } from '@nestjs/common';
import { IoRedisModule } from '../io-redis/io-redis.module';
import { AiService } from './ai.service';

@Module({
  imports: [IoRedisModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
