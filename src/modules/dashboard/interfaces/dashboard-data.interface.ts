import { Job } from '@/modules/jobs/entities/job.entity';

export interface DashboardData {
  metrics: Metrics;
  chartData: ChartData[];
  recentActivity: Job[];
  message?: string;
  emptyState?: boolean;
}

interface Metrics {
  totalDocuments: number;
  entitiesDetected: number;
  anonymizationRate: number;
  syntheticRecords: number;
}

interface ChartData {
  date: string;
  count: number | string;
}
