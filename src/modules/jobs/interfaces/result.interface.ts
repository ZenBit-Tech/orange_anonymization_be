import { AnalysisMetadata } from '../entities/job.entity';

export interface Result {
  mainContent: MainContent;
  entityTable: AnalysisMetadata[];
  auditTrail: AuditTrail;
}

interface MainContent {
  anonymizedText: string;
}

interface AuditTrail {
  jobId: string;
  framework: string;
  timestamps: {
    started: Date;
    finished: Date;
  };
  processingTime: number;
}
