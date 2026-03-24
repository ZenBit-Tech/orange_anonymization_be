import { Controller,  UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SyntheticDataService } from './synthetic-data.service';
import { JwtAuthGuard } from '@/common/guards/auth.guard';

@ApiTags('Synthetic Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('synthetic-data')
export class SyntheticDataController {
  constructor(private readonly service: SyntheticDataService) {}

  
 
}
