import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { VideoService } from './video.service';

@Module({
  imports: [PrismaModule],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
