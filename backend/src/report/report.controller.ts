import {
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Body,
  Query,
} from '@nestjs/common';
import * as express from 'express';
import { ReportService } from './report.service';
import { AtGuard, RolesGuard } from '../common/guards';
import { Roles, GetCurrentUserId } from '../common/decorators';
import { UserRole } from '../user/user.entity';

@UseGuards(AtGuard, RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateReport(
    @GetCurrentUserId() doctorId: string,
    @Body('userId') targetUserId: string,
  ) {
    return this.reportService.generateInitialReport(targetUserId, doctorId);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Post('generate-final')
  @HttpCode(HttpStatus.OK)
  async generateFinalReport(
    @GetCurrentUserId() doctorId: string,
    @Body('userId') targetUserId: string,
  ) {
    return this.reportService.generateFinalReport(targetUserId, doctorId);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get('download')
  async downloadReport(
    @GetCurrentUserId() doctorId: string,
    @Query('userId') targetUserId: string,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.reportService.generateInitialReportPDF(
      targetUserId,
      doctorId,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=intake_clinical_report.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get('download-final')
  async downloadFinalReport(
    @GetCurrentUserId() doctorId: string,
    @Query('userId') targetUserId: string,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.reportService.generateFinalReportPDF(
      targetUserId,
      doctorId,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=comprehensive_treatment_report.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
