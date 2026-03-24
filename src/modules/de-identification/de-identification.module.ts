import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Document } from './entities/document.entity';
import { DeIdentificationService } from './de-identification.service';
import { DeIdentificationController } from './de-identification.controller';
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
  providers: [DeIdentificationService, PresidioService],
  exports: [PresidioService], 
})
export class DeIdentificationModule {}
