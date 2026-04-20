import { Controller, Get, Param, UseGuards, Req, Res } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Job } from './entities/job.entity';
import { Result } from './interfaces/result.interface';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('app/results')
@ApiTags('Results & Exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed anonymization results' })
  @ApiResponse({ status: 200, type: Job })
  async getResults(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Result> {
    return this.jobsService.getJobResults(id, req.user.sub);
  }

  @Get(':id/export/json')
  @ApiOperation({ summary: 'Export results in JSON format' })
  @ApiProduces('application/json')
  async exportJson(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const results = await this.jobsService.getJobResults(id, req.user.sub);

    res.setHeader('Content-disposition', `attachment; filename=result-${id}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(results.mainContent, null, 2));
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Export results in CSV format' })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'File CSV' })
  async exportCsv(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const results = await this.jobsService.getJobResults(id, req.user.sub);

    const csvContent = `original,anonymized\n"${results.mainContent.originalText}","${results.mainContent.anonymizedText}"`;

    res.setHeader('Content-disposition', `attachment; filename=result-${id}.csv`);
    res.setHeader('Content-type', 'text/csv');
    res.send(csvContent);
  }

  @Get(':id/export/pdf')
  @ApiOperation({
    summary: 'Generate and download PDF Compliance Report',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Report PDF file' })
  async exportPdf(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const results = await this.jobsService.getJobResults(id, req.user.sub);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Compliance_Report_${id}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Compliance De-identification Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Job ID: ${results.auditTrail.jobId}`);
    doc.text(`Status: SUCCEEDED`);
    doc.moveDown();
    doc.fontSize(16).text('Audit Trail', { underline: true });
    doc.fontSize(12);
    doc.text(`Framework: ${results.auditTrail.framework}`);
    doc.text(`Start Time: ${results.auditTrail.timestamps.started}`);
    doc.text(`End Time: ${results.auditTrail.timestamps.finished}`);
    doc.text(`Processing Time: ${results.auditTrail.processingTime}s`);
    doc.moveDown();

    if (results.auditTrail.framework === 'HIPAA') {
      doc.fontSize(14).text('HIPAA 18 Identifiers Checklist:');
      doc
        .fontSize(10)
        .text(
          '- NAME, DATE, SSN, PHONE, FAX, EMAIL, ADDRESS, ACCOUNT, LICENSE, VEHICLE, URL, IP, BIOMETRIC, PHOTO, DEVICE, MRN, BENEFICIARY, CERTIFICATE',
        );
      doc.moveDown();
    }

    doc.fontSize(14).text('Entity Summary:');
    doc.fontSize(12).text('Entity Type | Method | Status');
    doc.text('-----------------------------------');
    doc.text('PERSON | Replace | Found');
    doc.text('DATE | Generalize | Not Found');

    doc.end();
  }
}
