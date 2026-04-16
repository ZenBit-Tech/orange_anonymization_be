import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { PresidioService } from './presidio.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private presidioService: PresidioService,
  ) {}

  @OnEvent('job.run')
  async handleJobRunEvent(payload: { jobId: string; userId: string }) {
    await this.processJob(payload.jobId, payload.userId);
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

  async update(id: string, updateDto: Partial<Job>, userId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id, userId } });
    if (!job) throw new NotFoundException(`Job not found or access denied`);

    Object.assign(job, updateDto);
    return this.jobRepository.save(job);
  }

  async processJob(jobId: string, userId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, userId },
    });
    if (!job) return;

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

      const entitiesToAnalyze: string[] =
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

      const analysisResults = await this.presidioService.analyzeText(
        job.originalText,
        language,
        entitiesToAnalyze,
        threshold,
      );

      job.wizardState.analysisMetadata = analysisResults;

      const strategies = (configSettings.strategies as Record<string, string>) || {};

      entitiesToAnalyze.forEach((entity) => {
        if (!strategies[entity]) {
          strategies[entity] = 'Replace';
        }
      });

      const anonymizedText = await this.presidioService.anonymizeText(
        job.originalText,
        analysisResults,
        strategies,
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

  async getStats(userId: string) {
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
      .getRawMany();

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

  async getJobResults(id: string, userId: string) {
    const job = await this.jobRepository.findOne({ where: { id, userId } });

    if (!job) throw new NotFoundException('Results not found');
    if (job.status !== JobStatus.SUCCEEDED) {
      throw new BadRequestException('Processing not yet complete');
    }

    return {
      mainContent: {
        originalText: job.originalText,
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

  async validateInput(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      throw new BadRequestException('Text must be at least 50 characters');
    }
  }
}
