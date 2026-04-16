import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job, JobStatus, WizardStateDto } from './entities/job.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('jobs')
@ApiTags('De-Identification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job draft' })
  @ApiResponse({ status: 201, type: Job })
  async create(@Req() req: RequestWithUser): Promise<Job> {
    const userId = req.user.sub;
    return this.jobsService.createDraft(userId);
  }

  @Get('latest-draft')
  @ApiOperation({ summary: 'Get the last draft' })
  @ApiResponse({ status: 200, type: Job, description: 'Return job or null' })
  @UseGuards(JwtAuthGuard)
  async getLatestDraft(@Req() req: RequestWithUser): Promise<Job | null> {
    const userId = req.user.sub;
    const job = await this.jobsService.getLatestDraft(userId);

    if (!job) {
      return null;
    }

    return job;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job data' })
  @ApiResponse({ status: 200, type: Job })
  async updateJob(
    @Param('id') id: string,
    @Body() updateData: Partial<Job>,
    @Req() req: RequestWithUser,
  ): Promise<Job> {
    const userId = req.user.sub;
    return this.jobsService.update(id, updateData, userId as string);
  }

  @Post(':id/run')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Start the analysis and anonymization process' })
  @ApiResponse({ status: 202, description: 'Request accepted for processing' })
  async runAnalysis(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Job> {
    const userId = req.user.sub;

    const job = await this.jobsService.update(id, { status: JobStatus.QUEUED }, userId);

    this.eventEmitter.emit('job.run', { jobId: id, userId });

    return job;
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file for processing (CSV, JSON, TXT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Data file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: Job })
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(csv|json|txt)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Job> {
    const userId = req.user.sub;
    const content = file.buffer.toString('utf-8');

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('No data found. File appears empty');
    }

    const lineCount = content.split('\n').length;

    return this.jobsService.update(
      id,
      {
        originalText: content,
        wizardState: {
          inputData: {
            fileName: file.originalname,
            fileSize: file.size,
            lineCount: lineCount,
          },
        } as unknown as Partial<WizardStateDto> as WizardStateDto,
      },
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job details' })
  @ApiResponse({ status: 200, type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Job> {
    const userId = req.user.sub;
    const job = await this.jobsService.findOne(id);

    if (job.userId !== userId) {
      throw new Error('You do not have access to this job');
    }
    return job;
  }
}
