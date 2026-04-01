import { Injectable } from '@nestjs/common';
import type { AnalyzeTextDto } from './dto/analyze-text.dto';

@Injectable()
export class DeIdentificationService {
  constructor() {}

  async analyzeText(_dto: AnalyzeTextDto) {}
  async anonymizeText() {}

  async getDocuments() {}
}
