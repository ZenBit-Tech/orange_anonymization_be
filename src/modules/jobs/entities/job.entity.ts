import { User } from '@/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface AnalysisMetadata {
  start: number;
  end: number;
  score: number;
  entity_type: string;
  recognition_metadata?: Record<string, unknown>;
}

export enum JobStatus {
  DRAFT = 'draft',
  CONFIGURED = 'configured',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export interface JobInputData {
  fileName?: string;
  fileSize?: number;
  lineCount?: number;
}

export class WizardStateDto {
  currentStep: number;
  frameworkSelection: string | null;
  inputData: JobInputData | null;
  configSettings: {
    language?: string;
    method?: string;
    entities?: string[];
    [key: string]: unknown;
  };
  analysisMetadata?: AnalysisMetadata[];
}

@Entity('jobs')
export class Job {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: JobStatus, default: JobStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 'user-uuid-here' })
  @Column()
  userId: string;

  @ApiProperty({ type: WizardStateDto })
  @Column({ type: 'json', nullable: true })
  wizardState: WizardStateDto;

  @ApiPropertyOptional({ example: 'HIPAA' })
  @Column({ nullable: true })
  framework: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  originalText: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  anonymizedText: string;

  @ApiPropertyOptional({ example: 1.25, description: 'Processing time in seconds' })
  @Column({ type: 'float', nullable: true })
  processingTime: number;

  @ApiPropertyOptional({ example: 'Connection timeout' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
