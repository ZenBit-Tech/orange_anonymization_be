import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '@/modules/de-identification/entities/document.entity';
import { SyntheticRecord } from '@/modules/synthetic-data/entities/synthetic-record.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, SyntheticRecord])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
