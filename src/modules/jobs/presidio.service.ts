import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import {
  AnalysisResult,
  AnonymizeResponse,
  PresidioOperator,
  PresidioOperators,
  Strategy,
} from './interfaces/presidio.interface';

const NATIVE_STRATEGIES: Set<string> = new Set([Strategy.Redact, Strategy.Replace, Strategy.Hash]);
const DEFAULT_THRESHOLD = 0.5;
const MASK_KEEP_CHARS = 2;
const PSEUDONYM_PREFIX = 'PSE-';
const PSEUDONYM_HASH_LENGTH = 12;
const SYNTHETIC_DEFAULT_ALPHANUMERIC_LENGTH = 10;
const SYNTHETIC_SSN_GROUP_1 = 3;
const SYNTHETIC_SSN_GROUP_2 = 2;
const SYNTHETIC_SSN_GROUP_3 = 4;
const SYNTHETIC_DRIVER_LICENSE_LENGTH = 9;
const SYNTHETIC_MRN_DIGITS = 8;
const FAKER_DATE_ISO_PREFIX_LENGTH = 10;

@Injectable()
export class PresidioService {
  constructor(private readonly configService: ConfigService) {}

  async analyzeText(
    text: string,
    language: string,
    entities: string[],
    threshold: number = DEFAULT_THRESHOLD,
  ): Promise<AnalysisResult[]> {
    try {
      const response = await axios.post<AnalysisResult[]>(
        `${this.configService.get<string>('presidio.analyzerUrl')}/analyze`,
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

  async anonymizeText(
    text: string,
    analyzeResults: AnalysisResult[],
    strategies: Record<string, string>,
  ): Promise<string> {
    const customEntities: AnalysisResult[] = [];
    const nativeEntities: AnalysisResult[] = [];

    for (const result of analyzeResults) {
      const strategy = strategies[result.entity_type] ?? Strategy.Replace;
      if (NATIVE_STRATEGIES.has(strategy)) {
        nativeEntities.push({ ...result });
      } else {
        customEntities.push(result);
      }
    }

    customEntities.sort((a, b) => b.start - a.start);

    const tokenCounters: Record<string, number> = {};
    let modifiedText = text;

    for (const custom of customEntities) {
      const strategy = strategies[custom.entity_type] ?? Strategy.Replace;
      const original = modifiedText.slice(custom.start, custom.end);
      const replacement = this.applyCustomStrategy(
        strategy,
        original,
        custom.entity_type,
        tokenCounters,
      );

      const delta = replacement.length - (custom.end - custom.start);
      modifiedText =
        modifiedText.slice(0, custom.start) + replacement + modifiedText.slice(custom.end);

      if (delta !== 0) {
        for (const native of nativeEntities) {
          if (native.start >= custom.end) {
            native.start += delta;
            native.end += delta;
          }
        }
      }
    }

    if (nativeEntities.length === 0) {
      return modifiedText;
    }

    const operators: PresidioOperators = {};
    for (const native of nativeEntities) {
      if (!operators[native.entity_type]) {
        const strategy = strategies[native.entity_type] ?? Strategy.Replace;
        operators[native.entity_type] = this.buildPresidioOperator(strategy, native.entity_type);
      }
    }

    try {
      const response = await axios.post<AnonymizeResponse>(
        `${this.configService.get<string>('presidio.anonymizerUrl')}/anonymize`,
        {
          text: modifiedText,
          analyzer_results: nativeEntities,
          anonymizers: operators,
        },
      );
      return response.data.text;
    } catch {
      throw new ServiceUnavailableException('De-identification service unavailable');
    }
  }

  private buildPresidioOperator(strategy: string, entityType: string): PresidioOperator {
    switch (strategy) {
      case Strategy.Redact:
        return { type: 'redact' };
      case Strategy.Hash:
        return { type: 'hash', hash_type: 'sha256' };
      case Strategy.Replace:
      default:
        return { type: 'replace', new_value: `<${entityType}>` };
    }
  }

  private applyCustomStrategy(
    strategy: string,
    original: string,
    entityType: string,
    tokenCounters: Record<string, number>,
  ): string {
    switch (strategy) {
      case Strategy.Mask: {
        const keep = Math.min(MASK_KEEP_CHARS, original.length);
        return original.slice(0, keep) + '*'.repeat(original.length - keep);
      }
      case Strategy.Synthetic:
        return this.generateFakeValue(entityType);
      case Strategy.Token: {
        tokenCounters[entityType] = (tokenCounters[entityType] ?? 0) + 1;
        return `[${entityType}_${tokenCounters[entityType]}]`;
      }
      case Strategy.Generalise:
        return `[${entityType.toLowerCase().replace(/_/g, ' ')}]`;
      case Strategy.Pseudonymise:
        return (
          PSEUDONYM_PREFIX +
          createHash('sha256').update(original).digest('hex').slice(0, PSEUDONYM_HASH_LENGTH)
        );
      case Strategy.NLP:
        return '';
      default:
        return `<${entityType}>`;
    }
  }

  private generateFakeValue(entityType: string): string {
    switch (entityType) {
      case 'PERSON':
        return faker.person.fullName();
      case 'EMAIL_ADDRESS':
        return faker.internet.email();
      case 'PHONE_NUMBER':
        return faker.phone.number();
      case 'LOCATION':
        return faker.location.city();
      case 'DATE_TIME':
        return faker.date.past().toISOString().slice(0, FAKER_DATE_ISO_PREFIX_LENGTH);
      case 'IP_ADDRESS':
        return faker.internet.ip();
      case 'URL':
        return faker.internet.url();
      case 'IBAN_CODE':
        return faker.finance.iban();
      case 'US_SSN':
        return (
          faker.string.numeric(SYNTHETIC_SSN_GROUP_1) +
          '-' +
          faker.string.numeric(SYNTHETIC_SSN_GROUP_2) +
          '-' +
          faker.string.numeric(SYNTHETIC_SSN_GROUP_3)
        );
      case 'CREDIT_CARD':
        return faker.finance.creditCardNumber();
      case 'US_DRIVER_LICENSE':
        return faker.string.alphanumeric(SYNTHETIC_DRIVER_LICENSE_LENGTH).toUpperCase();
      case 'MEDICAL_RECORD_NUMBER':
        return 'MRN-' + faker.string.numeric(SYNTHETIC_MRN_DIGITS);
      default:
        return faker.string.alphanumeric(SYNTHETIC_DEFAULT_ALPHANUMERIC_LENGTH);
    }
  }
}
