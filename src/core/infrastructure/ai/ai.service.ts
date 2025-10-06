import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { Injectable } from '@nestjs/common';
import { generateObject, Schema } from 'ai';
import { IoRedisService } from '../io-redis/io-redis.service';
import { ModelProvider } from './types/types';

@Injectable()
export class AiService {
  constructor(private readonly redisService: IoRedisService) {}

  private readonly MAX_LIMIT_TOKENS = 80 * 10000;
  private readonly modelProviders: ModelProvider[] = ['openai', 'grok'];

  async generateObj<T>(prompt: string, schema: Schema<T>) {
    for (const modelProvider of this.modelProviders) {
      const usage = await this.redisService.get(
        this.generateUsageKey(modelProvider),
      );

      const currentUsage = parseInt(usage ?? '0');

      if (currentUsage <= this.MAX_LIMIT_TOKENS) {
        return this.generateObjFromAi(modelProvider, prompt, schema);
      }
    }

    return null;
  }

  private async generateObjFromAi<T>(
    modelProvider: ModelProvider,
    prompt: string,
    schema: Schema<T>,
  ) {
    const model = this.getModel(modelProvider);

    const {
      object,
      usage: { outputTokens },
    } = await generateObject({
      model,
      schema,
      prompt,
      output: 'object',
    });

    await this.redisService.incrby(
      this.generateUsageKey(modelProvider),
      outputTokens ?? 2000,
    );

    const ttl = await this.redisService.getTtlSeconds(
      this.generateUsageKey(modelProvider),
    );

    if (ttl === -1) {
      await this.redisService.expireInDays(
        this.generateUsageKey(modelProvider),
        30,
      );
    }

    return object;
  }

  private getModel(modelProvider: ModelProvider) {
    switch (modelProvider) {
      case 'openai':
        return openai('chatgpt-4o-latest');
      default:
        return xai('grok-4');
    }
  }

  private generateUsageKey(modelProvider: ModelProvider) {
    return `ai:usage:${modelProvider}`;
  }
}
