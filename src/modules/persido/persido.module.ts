import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Document } from './entities/document.entity';
import { DeIdentificationService } from './services/de-identification.service';
import { SyntheticDataService } from './services/synthetic-data.service';
import { DeIdentificationController } from './persido.controller';
import { PresidioService } from './presidio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    HttpModule.register({
      timeout: 30_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [DeIdentificationController],
  providers: [DeIdentificationService, PresidioService,SyntheticDataService],
  exports: [PresidioService], 
})
export class DeIdentificationModule {}
