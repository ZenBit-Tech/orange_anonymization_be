import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyntheticRecord } from './entities/synthetic-record.entity';
import { SyntheticDataService } from './synthetic-data.service';
import { SyntheticDataController } from './synthetic-data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SyntheticRecord])],
  controllers: [SyntheticDataController],
  providers: [SyntheticDataService],
  exports: [SyntheticDataService],
})
export class SyntheticDataModule {}
