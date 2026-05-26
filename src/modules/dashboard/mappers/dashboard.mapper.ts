import { DashboardDataDto } from '../dto/dashboard.data.dto';
import { DashboardData } from '@/modules/dashboard/interfaces/dashboard-data.interface';

export class DashboardMapper {
  static toDto(data: DashboardData): DashboardDataDto {
    return {
      metrics: data.metrics,
      chartData: data.chartData,
      recentActivity: data.recentActivity,
      strategiesDistribution: data.strategiesDistribution,
      frameworksDistribution: data.frameworksDistribution,
      entitiesDistribution: data.entitiesDistribution,
      message: data.message,
      emptyState: data.emptyState,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }
}
