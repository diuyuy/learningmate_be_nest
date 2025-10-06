import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './io-redis.module-definition';
import { IoRedisService } from './io-redis.service';

@Module({
  providers: [IoRedisService],
  exports: [IoRedisService],
})
export class IoRedisModule extends ConfigurableModuleClass {}
