import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { PresidioService } from './presidio.service';
import { Result } from './interfaces/result.interface';
import { AnalysisResult } from './interfaces/presidio.interface';
import { ChartData, DashboardData } from '../dashboard/interfaces/dashboard-data.interface';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private presidioService: PresidioService,
  ) {}

  @OnEvent('job.run')
  async handleJobRunEvent(payload: { jobId: string; userId: string; originalText: string }) {
    await this.processJob(payload.jobId, payload.userId, payload.originalText);
  }

  async createDraft(userId: string): Promise<Job> {
    const jobData: DeepPartial<Job> = {
      userId,
      status: JobStatus.DRAFT,
      wizardState: {
        currentStep: 1,
        frameworkSelection: '',
        inputData: {},
        configSettings: {},
      },
    };
    const job = this.jobRepository.create(jobData);
    return this.jobRepository.save(job);
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    return job;
  }

  async getLatestDraft(userId: string): Promise<Job | null> {
    return this.jobRepository.findOne({
      where: [
        { userId, status: JobStatus.DRAFT },
        { userId, status: JobStatus.CONFIGURED },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  async update(id: string, updateJobData: Partial<Job>, userId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id, userId } });
    if (!job) throw new NotFoundException(`Job not found or access denied`);

    Object.assign(job, updateJobData);
    return this.jobRepository.save(job);
  }

  async processJob(jobId: string, userId: string, originalText: string): Promise<void> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, userId },
    });
    if (!job) return;

    const hipaaToPresidioMap: Record<string, string> = {
      NAME: 'PERSON',
      DATE: 'DATE_TIME',
      SSN: 'US_SSN',
      PHONE: 'PHONE_NUMBER',
      FAX: 'PHONE_NUMBER',
      EMAIL: 'EMAIL_ADDRESS',
      ADDRESS: 'LOCATION',
      ACCOUNT: 'IBAN_CODE',
      LICENSE: 'US_DRIVER_LICENSE',
      URL: 'URL',
      IP: 'IP_ADDRESS',
      MRN: 'MEDICAL_RECORD_NUMBER',
    };

    const timeout = setTimeout(
      async () => {
        const currentJob = await this.jobRepository.findOne({ where: { id: jobId } });
        if (currentJob?.status === JobStatus.PROCESSING) {
          currentJob.status = JobStatus.FAILED;
          currentJob.errorMessage = 'Processing is taking longer than expected';
          await this.jobRepository.save(currentJob);
        }
      },
      5 * 60 * 1000,
    );

    try {
      job.status = JobStatus.PROCESSING;
      await this.jobRepository.save(job);

      const startTime = Date.now();
      const { frameworkSelection, configSettings } = job.wizardState;

      const language = configSettings.language || 'en';
      const threshold = Number(configSettings.threshold) || 0.5;

      const hipaaEntities =
        frameworkSelection === 'HIPAA' && configSettings.method === 'Safe Harbor'
          ? [
              'NAME',
              'DATE',
              'SSN',
              'PHONE',
              'FAX',
              'EMAIL',
              'ADDRESS',
              'ACCOUNT',
              'LICENSE',
              'VEHICLE',
              'URL',
              'IP',
              'BIOMETRIC',
              'PHOTO',
              'DEVICE',
              'MRN',
              'BENEFICIARY',
              'CERTIFICATE',
            ]
          : configSettings.entities || [];

      const presidioEntities = hipaaEntities.map((entity) => hipaaToPresidioMap[entity] || entity);

      const analysisResults: AnalysisResult[] = await this.presidioService.analyzeText(
        originalText,
        language,
        presidioEntities,
        threshold,
      );

      job.wizardState.analysisMetadata = analysisResults;

      const userStrategies = (configSettings.strategies as Record<string, string>) || {};
      const presidioStrategies: Record<string, string> = {};

      hipaaEntities.forEach((hipaaEntity) => {
        const presidioKey = hipaaToPresidioMap[hipaaEntity] || hipaaEntity;
        const strategy = userStrategies[hipaaEntity] || 'Replace';
        presidioStrategies[presidioKey] = strategy;
      });

      const anonymizedText: string = await this.presidioService.anonymizeText(
        originalText,
        analysisResults,
        presidioStrategies,
      );

      job.anonymizedText = anonymizedText;
      job.processingTime = (Date.now() - startTime) / 1000;
      job.status = JobStatus.SUCCEEDED;
      job.errorMessage = null;

      await this.jobRepository.save(job);
      clearTimeout(timeout);
    } catch (error) {
      clearTimeout(timeout);
      job.status = JobStatus.FAILED;
      job.errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await this.jobRepository.save(job);
    }
  }

  async getStats(userId: string): Promise<DashboardData> {
    const totalDocuments = await this.jobRepository.count({
      where: { userId, status: JobStatus.SUCCEEDED },
    });

    const recentActivity = await this.jobRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
      select: ['id', 'framework', 'status', 'createdAt'],
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chartData = await this.jobRepository
      .createQueryBuilder('job')
      .select("DATE_FORMAT(job.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(job.id)', 'count')
      .where('job.userId = :userId', { userId })
      .andWhere('job.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<ChartData>();

    return {
      metrics: {
        totalDocuments,
        entitiesDetected: 0,
        anonymizationRate: totalDocuments > 0 ? 100 : 0,
        syntheticRecords: 0,
      },
      chartData,
      recentActivity,
    };
  }

  async getJobResults(id: string, userId: string): Promise<Result> {
    const job = await this.jobRepository.findOne({ where: { id, userId } });

    if (!job) throw new NotFoundException('Results not found');
    if (job.status !== JobStatus.SUCCEEDED) {
      throw new BadRequestException('Processing not yet complete');
    }

    return {
      mainContent: {
        anonymizedText: job.anonymizedText,
      },
      entityTable: job.wizardState.analysisMetadata || [],
      auditTrail: {
        jobId: job.id,
        framework: job.framework,
        timestamps: {
          started: job.createdAt,
          finished: job.updatedAt,
        },
        processingTime: job.processingTime,
      },
    };
  }

  async validateInput(text: string): Promise<void> {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      throw new BadRequestException('Text must be at least 50 characters');
    }
  }
}
