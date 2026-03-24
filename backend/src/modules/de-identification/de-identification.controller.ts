import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeIdentificationService } from './de-identification.service';

import { JwtAuthGuard } from '@/common/guards/auth.guard';


@ApiTags('De-Identification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('de-identification')
export class DeIdentificationController {
  constructor(private readonly service: DeIdentificationService) {}
  
 
}
