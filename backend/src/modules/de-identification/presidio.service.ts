import { Injectable, Logger } from '@nestjs/common';

interface ReplaceOperator {
  type: 'replace';
  new_value: string;  
}

interface RedactOperator {
  type: 'redact';
}

interface HashOperator {
  type: 'hash';
  hash_type: 'sha256' | 'sha512' | 'md5';
}

interface EncryptOperator {
  type: 'encrypt';
  key: string; 
}

type AnonymizerOperator = ReplaceOperator | RedactOperator | HashOperator | EncryptOperator;

@Injectable()
export class PresidioService {
  private readonly logger = new Logger(PresidioService.name);
 

  constructor( ) {
  }
  async analyzeText() {}
  async anonymizeText() {}
}
