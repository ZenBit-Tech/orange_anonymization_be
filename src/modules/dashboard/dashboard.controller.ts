import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardData } from './interfaces/dashboard-data.interface';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('app/dashboard')
@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getDashboardData(@Req() req: RequestWithUser): Promise<DashboardData> {
    const userId = req.user.sub;
    const stats = await this.jobsService.getStats(userId);

    if (stats.metrics.totalDocuments === 0) {
      return {
        ...stats,
        message: 'Start your first analysis',
        emptyState: true,
      };
    }

    return stats;
  }
}
