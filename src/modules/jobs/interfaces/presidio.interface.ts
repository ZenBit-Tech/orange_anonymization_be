// Результат аналізу від Analyzer
export interface AnalysisResult {
  start: number;
  end: number;
  score: number;
  entity_type: string;
  recognition_metadata?: Record<string, unknown>;
}

export interface PresidioOperator {
  type: string;
  new_value?: string;
  hash_type?: string;
}

export interface AnonymizeResponse {
  text: string;
  items: Array<{
    start: number;
    end: number;
    entity_type: string;
    operator: string;
    text: string;
  }>;
}

export type PresidioOperators = Record<string, PresidioOperator>;

export enum Strategy {
  Redact = 'Redact',
  Replace = 'Replace',
  Hash = 'Hash',
  Mask = 'Mask',
  Synthetic = 'Synthetic',
  Token = 'Token',
  Generalise = 'Generalise',
  Pseudonymise = 'Pseudonymise',
  NLP = 'NLP',
}

export enum Framework {
  Hipaa = 'hipaa',
}

export enum HipaaMethod {
  SafeHarbor = 'Safe Harbor',
}
