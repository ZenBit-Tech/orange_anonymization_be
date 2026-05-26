import { ApiProperty } from '@nestjs/swagger';
import { MetricsDto } from './metrics.dto';
import { ChartDataDto } from './chart.data.dto';
import { RecentActivityDto } from './recent.activity.dto';
import { DistributionDataDto } from './distribution.data.dto';

export class DashboardDataDto {
  @ApiProperty({ type: MetricsDto })
  metrics: MetricsDto;

  @ApiProperty({ type: [ChartDataDto] })
  chartData: ChartDataDto[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[];

  @ApiProperty({ type: [DistributionDataDto] })
  strategiesDistribution: DistributionDataDto[];

  @ApiProperty({ type: [DistributionDataDto] })
  frameworksDistribution: DistributionDataDto[];

  @ApiProperty({ type: [DistributionDataDto] })
  entitiesDistribution: DistributionDataDto[];

  @ApiProperty({ required: false, nullable: true })
  message?: string;

  @ApiProperty({ required: false })
  emptyState?: boolean;

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;
}
