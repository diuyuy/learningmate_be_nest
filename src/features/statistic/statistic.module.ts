import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infrastructure/prisma-module/prisma.module';
import { StatisticService } from './statistic.service';

@Module({
  imports: [PrismaModule],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
