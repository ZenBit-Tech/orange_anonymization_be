import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SyntheticDataService } from './synthetic-data.service';
import { GenerateSyntheticDataDto } from './dto/generate-synthetic-data.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('synthetic-data')
@ApiTags('Synthetic Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SyntheticDataController {
  constructor(private readonly syntheticDataService: SyntheticDataService) {}

  @Get('source/:jobId')
  @ApiOperation({ summary: 'Get de-identified source text for the current session' })
  @ApiResponse({ status: 200, description: 'Returns the anonymized text for the given job' })
  async getSourcePreview(
    @Param('jobId') jobId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ jobId: string; sourceText: string }> {
    return this.syntheticDataService.getSourcePreview(jobId, req.user.sub);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate synthetic data from manual or de-identified source text' })
  @ApiResponse({ status: 200, description: 'Synthetic data payload generated successfully' })
  async generate(
    @Body() dto: GenerateSyntheticDataDto,
    @Req() req: RequestWithUser,
  ): Promise<unknown> {
    return this.syntheticDataService.generate(dto, req.user.sub);
  }
}