import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';
import { HealthStatusDto } from './dto/health-status.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is up',
    type: HealthStatusDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Service is not ready to accept traffic',
  })
  check(): HealthStatusDto {
    return { status: 'ok' };
  }
}
