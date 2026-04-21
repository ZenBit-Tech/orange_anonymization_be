// Результат аналізу від Analyzer
export interface AnalysisResult {
  start: number;
  end: number;
  score: number;
  entity_type: string;
  recognition_metadata?: Record<string, unknown>;
}

interface PresidioOperator {
  type: string;
  new_value?: string;
  masking_char?: string;
  chars_to_mask?: number;
  from_end?: boolean;
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
