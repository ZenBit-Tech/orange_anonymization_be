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

  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Generate and download PDF Compliance Report' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Report PDF file' })
  async exportPdf(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const results = await this.jobsService.getJobResults(id, req.user.sub);
    const job = await this.jobsService.findOne(id);

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
    doc.text(`Framework: ${results.auditTrail.framework.toUpperCase()}`);
    doc.text(`Start Time: ${new Date(results.auditTrail.timestamps.started).toUTCString()}`);
    doc.text(`End Time: ${new Date(results.auditTrail.timestamps.finished).toUTCString()}`);
    doc.text(`Processing Time: ${results.auditTrail.processingTime}s`);
    doc.moveDown();

    if (results.auditTrail.framework.toUpperCase() === 'HIPAA') {
      doc.fontSize(14).text('HIPAA 18 Identifiers Checklist:');
      doc
        .fontSize(10)
        .fillColor('gray')
        .text(
          'NAME, DATE, SSN, PHONE, FAX, EMAIL, ADDRESS, ACCOUNT, LICENSE, VEHICLE, URL, IP, BIOMETRIC, PHOTO, DEVICE, MRN, BENEFICIARY, CERTIFICATE',
        );
      doc.fillColor('black').moveDown();
    }

    doc.fontSize(14).text('Entity Summary:');
    doc.moveDown(0.5);

    const presidioToHipaaMap: Record<string, string> = {
      PERSON: 'NAME',
      DATE_TIME: 'DATE',
      EMAIL_ADDRESS: 'EMAIL',
      PHONE_NUMBER: 'PHONE/FAX',
      LOCATION: 'ADDRESS',
      US_SSN: 'SSN',
      IP_ADDRESS: 'IP',
      MEDICAL_RECORD_NUMBER: 'MRN',
    };

    const headerY = doc.y;
    doc.fontSize(10).text('Entity Type', 50, headerY);
    doc.text('Method', 200, headerY);
    doc.text('Result', 350, headerY);
    doc.text(
      '----------------------------------------------------------------------------------',
      50,
      headerY + 15,
    );

    let currentY = headerY + 30;

    const foundEntityTypes = new Set(results.entityTable.map((e) => e.entity_type));
    const strategies = job.wizardState.configSettings.strategies || {};

    Object.entries(strategies).forEach(([hipaaType, method]) => {
      const presidioType =
        Object.keys(presidioToHipaaMap).find((key) => presidioToHipaaMap[key] === hipaaType) ||
        hipaaType;
      const isFound = foundEntityTypes.has(presidioType);

      doc.text(hipaaType, 50, currentY);
      doc.text(method as string, 200, currentY);

      if (isFound) {
        doc.fillColor('green').text('DETECTED', 350, currentY).fillColor('black');
      } else {
        doc.fillColor('gray').text('Not Found', 350, currentY).fillColor('black');
      }

      currentY += 20;

      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.end();
  }
}
