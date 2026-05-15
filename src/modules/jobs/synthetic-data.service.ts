import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PresidioService } from './presidio.service';
import { JobsService } from './jobs.service';
import { GenerateSyntheticDataDto } from './dto/generate-synthetic-data.dto';
import { AnalysisResult, Framework, Strategy } from './interfaces/presidio.interface';
import { JobStatus } from './entities/job.entity';

interface SyntheticDataGenerationResponse {
  outputFormat: string;
  source: {
    kind: 'deidentified-job' | 'manual';
    jobId?: string;
  };
  records: number;
  generatedAt: string;
  data: string[];
}

@Injectable()
export class SyntheticDataService {
  private readonly hipaaToPresidioMap: Record<string, string> = {
    NAME: 'PERSON',
    DATE: 'DATE_TIME',
    SSN: 'US_SSN',
    PHONE: 'PHONE_NUMBER',
    FAX: 'PHONE_NUMBER',
    EMAIL: 'EMAIL_ADDRESS',
    ADDRESS: 'LOCATION',
    URL: 'URL',
    IP: 'IP_ADDRESS',
    LICENSE: 'US_DRIVER_LICENSE',
    VEHICLE: 'VEHICLE',
    BIOMETRIC: 'BIOMETRIC',
    PHOTO: 'PHOTO',
    DEVICE: 'IP_ADDRESS',
    BENEFICIARY: 'PERSON',
    CERTIFICATE: 'US_SSN',
    ACCOUNT: 'IBAN_CODE',
    MRN: 'MEDICAL_RECORD_NUMBER',
    HEALTH_PLAN: 'HEALTH_PLAN',
    ZIP: 'LOCATION',
  };

  private readonly gdprToPresidioMap: Record<string, string> = {
    PERSON: 'PERSON',
    ORGANIZATION: 'ORGANIZATION',
    LOCATION: 'LOCATION',
    DATE: 'DATE_TIME',
    IP: 'IP_ADDRESS',
    GEOPOINT: 'LOCATION',
    NATIONAL_ID: 'US_SSN',
    ID_NUMBER: 'US_SSN',
    PASSPORT: 'US_PASSPORT',
    CREDIT_CARD: 'CREDIT_CARD',
    BANK_ACCOUNT: 'IBAN_CODE',
    EMAIL: 'EMAIL_ADDRESS',
    PHONE: 'PHONE_NUMBER',
    MEDICAL_RECORD_NUMBER: 'MEDICAL_RECORD_NUMBER',
    DEVICE_ID: 'IP_ADDRESS',
  };

  constructor(
    private readonly jobsService: JobsService,
    private readonly presidioService: PresidioService,
  ) {}

  async getSourcePreview(
    jobId: string,
    userId: string,
  ): Promise<{ jobId: string; sourceText: string }> {
    const result = await this.jobsService.getJobResults(jobId, userId);

    if (!result.mainContent.anonymizedText?.trim()) {
      throw new NotFoundException('De-identified source data is not available for the provided jobId');
    }

    return {
      jobId,
      sourceText: result.mainContent.anonymizedText,
    };
  }

  async generate(
    dto: GenerateSyntheticDataDto,
    userId: string,
  ): Promise<SyntheticDataGenerationResponse> {
    const sourceText = await this.resolveSourceText(dto, userId);
    const analysisResults = await this.analyzeSource(dto.framework, sourceText);
    const syntheticStrategies = this.buildSyntheticStrategies(analysisResults);

    const data: string[] = [];

    for (let index = 0; index < dto.records; index += 1) {
      const syntheticRecord = await this.presidioService.anonymizeText(
        sourceText,
        analysisResults,
        syntheticStrategies,
      );
      data.push(syntheticRecord);
    }

    return {
      outputFormat: dto.outputFormat,
      source: dto.useDeidentifiedSource
        ? { kind: 'deidentified-job', jobId: dto.sourceJobId }
        : { kind: 'manual' },
      records: dto.records,
      generatedAt: new Date().toISOString(),
      data,
    };
  }

  private async resolveSourceText(dto: GenerateSyntheticDataDto, userId: string): Promise<string> {
    if (dto.useDeidentifiedSource) {
      if (!dto.sourceJobId) {
        throw new BadRequestException('sourceJobId is required when using de-identified data');
      }

      const job = await this.jobsService.findOne(dto.sourceJobId);

      if (job.userId !== userId) {
        throw new ForbiddenException('You do not have access to the requested source job');
      }

      if (job.status !== JobStatus.SUCCEEDED || !job.anonymizedText?.trim()) {
        throw new NotFoundException('De-identified source data is not available for the provided jobId');
      }

      return job.anonymizedText;
    }

    if (!dto.sourceText?.trim()) {
      throw new BadRequestException('Source text is required when de-identified source is disabled');
    }

    return dto.sourceText.trim();
  }

  private async analyzeSource(framework: string, sourceText: string): Promise<AnalysisResult[]> {
    const entityMap = this.getEntityMap(framework);
    const entities = [...new Set(Object.values(entityMap))];

    return this.presidioService.analyzeText(sourceText, 'en', entities, 0.5);
  }

  private buildSyntheticStrategies(results: AnalysisResult[]): Record<string, string> {
    return results.reduce<Record<string, string>>((strategies, result) => {
      strategies[result.entity_type] = Strategy.Synthetic;
      return strategies;
    }, {});
  }

  private getEntityMap(framework: string): Record<string, string> {
    return framework.toLowerCase() === Framework.Hipaa ? this.hipaaToPresidioMap : this.gdprToPresidioMap;
  }
}