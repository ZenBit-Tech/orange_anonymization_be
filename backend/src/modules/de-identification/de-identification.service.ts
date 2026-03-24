import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { PresidioService } from './presidio.service';
import type { AnalyzeTextDto } from './dto/analyze-text.dto';

@Injectable()
export class DeIdentificationService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly presidioService: PresidioService,
  ) {}

  
  async analyzeText(dto: AnalyzeTextDto) {
    
  }
  async anonymizeText() {
    
  }

  async getDocuments(
   
  ) {
   
  }

  
}
