import { JobStatus } from '@/modules/jobs/entities/job.entity';

export interface DashboardData {
  metrics: Metrics;
  chartData: ChartData[];
  recentActivity: RecentActivity[];
  message?: string;
  emptyState?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface RecentActivity {
  id: string;
  framework: string;
  status: JobStatus;
  createdAt: string;
  fileName: string | null;
  entitiesCount: number;
}

export interface RecentActivityResponse {
  data: RecentActivity[];
  total: number;
  page: number;
  limit: number;
}

interface Metrics {
  totalDocuments: number;
  entitiesDetected: number;
  anonymizationRate: number;
  syntheticRecords: number;
}

export interface ChartData {
  date: string;
  documents: number;
  entities: number;
}

export interface DistributionData {
  name: string;
  count: number;
}
