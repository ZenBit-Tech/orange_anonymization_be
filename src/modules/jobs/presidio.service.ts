import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PresidioOperator {
  type: string;
  new_value?: string;
  masking_char?: string;
  chars_to_mask?: number;
  from_end?: boolean;
}

type PresidioOperators = Record<string, PresidioOperator>;

@Injectable()
export class PresidioService {
  constructor(private readonly configService: ConfigService) {}

  async analyzeText(text: string, language: string, entities: string[], threshold: number = 0.5) {
    try {
      const response = await axios.post(
        `${this.configService.get<string>('ANALYZER_URL')}/analyze`,
        {
          text,
          language,
          entities,
          score_threshold: threshold,
        },
      );
      return response.data;
    } catch {
      throw new ServiceUnavailableException('De-identification service unavailable');
    }
  }

  async anonymizeText(text: string, analyzeResults: unknown[], strategies: Record<string, string>) {
    const operators: PresidioOperators = {};

    for (const [entity, strategy] of Object.entries(strategies)) {
      operators[entity] = {
        type: this.mapStrategyToPresidio(strategy),
      };

      if (strategy === 'Redact') {
        operators[entity].new_value = '****';
      }
    }

    try {
      const response = await axios.post(
        `${this.configService.get<string>('ANONYMIZER_URL')}/anonymize`,
        {
          text,
          analyzer_results: analyzeResults,
          operators: operators,
        },
      );

      return response.data.text;
    } catch (error) {
      throw new ServiceUnavailableException('De-identification service unavailable');
    }
  }

  private mapStrategyToPresidio(strategy: string): string {
    const map: Record<string, string> = {
      Replace: 'replace',
      Redact: 'redact',
      Hash: 'hash',
      Mask: 'mask',
    };
    return map[strategy] || 'replace';
  }
}
