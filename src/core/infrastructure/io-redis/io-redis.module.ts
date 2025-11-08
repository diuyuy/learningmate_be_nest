import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigurableModuleClass } from './io-redis.module-definition';
import { IoRedisService } from './io-redis.service';

@Module({
  providers: [IoRedisService, CacheService],
  exports: [IoRedisService, CacheService],
})
export class IoRedisModule extends ConfigurableModuleClass {}
