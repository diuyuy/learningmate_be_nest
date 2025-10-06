import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewModule {}
