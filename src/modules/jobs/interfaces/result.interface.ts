export interface Result {
  mainContent: MainContent;
  entityTable: Record<string, unknown> | never[];
  auditTrail: AuditTrail;
}

interface MainContent {
  originalText: string;
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
