import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JobsService } from '@/modules/jobs/jobs.service';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { DashboardDataDto } from './dto/dashboard.data.dto';
import { RecentActivityResponse } from '@/modules/dashboard/interfaces/dashboard.data.interface';
import { DashboardFramework } from './dashboard.framework.type';
import { DashboardMapper } from './mappers/dashboard.mapper';

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

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview analytics',
  })
  @ApiOkResponse({
    type: DashboardDataDto,
  })
  async getDashboardOverview(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('framework') framework?: DashboardFramework,
  ): Promise<DashboardDataDto> {
    const userId = req.user.sub;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const stats = await this.jobsService.getStats(userId, start, end, framework);
    const dto = DashboardMapper.toDto(stats);

    if (dto.metrics.totalDocuments === 0 && !startDate) {
      return {
        ...dto,
        message: 'Start your first analysis',
        emptyState: true,
      };
    }

    return dto;
  }
}

@Controller('app/analyses')
@ApiTags('Analyses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalysesController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all analyses (paginated)',
  })
  async getAnalyses(
    @Req() req: RequestWithUser,

    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('startDate')
    startDate?: string,

    @Query('endDate')
    endDate?: string,

    @Query('framework')
    framework?: DashboardFramework,
  ): Promise<RecentActivityResponse> {
    return this.jobsService.getRecentActivity(
      req.user.sub,
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      framework,
    );
  }
}
