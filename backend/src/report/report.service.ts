import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TreatmentService } from '../treatment/treatment.service';
import { ClinicalReportType } from '../treatment/constants/clinical-report-type.enum';
import { AiUsageService } from '../ai/ai-usage.service';
import { GeminiService } from '../ai/gemini.service';
import { renderMarkdownToPdf } from './markdown-pdf.renderer';

@Injectable()
export class ReportService {
  constructor(
    private treatmentService: TreatmentService,
    private aiUsageService: AiUsageService,
    private geminiService: GeminiService,
  ) {}

  async generateInitialReport(
    patientId: string,
    doctorId: string,
  ): Promise<{ report: string; reportId: string }> {
    const plan = await this.treatmentService.validateInitialReportEligible(patientId);
    const fullTranscript = await this.treatmentService.getIntakeTranscript(patientId);

    if (!this.geminiService.isConfigured()) {
      throw new InternalServerErrorException('AI Service not configured');
    }

    try {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const prompt = `
You are a senior clinical psychiatrist. Review the intake transcript and write a clinical summary.

Required sections (use ## headings exactly like these titles):
## Patient Identification & Presentation
## Primary Concerns and Symptoms
## Emotional State and Behavioral Observations
## Risk Factors
## Provisional Assessment
## Recommended Next Steps

Formatting rules for clean PDF rendering:
- Use real calendar date "${today}" — never write placeholders like [Current Date]
- Use ### for subsections only
- Use "- " bullet lists; keep each bullet on one line as: - **Label:** description
- Use numbered lists only under Recommended Next Steps
- Prefer short paragraphs; avoid tables and nested lists deeper than one level
- Do not invent patient demographics not present in the transcript
- Output markdown only — no preamble or closing remarks

TRANSCRIPT:
${fullTranscript}
`;

      const report = await this.callAI(prompt, patientId);
      const saved = await this.treatmentService.saveReport(
        plan.id,
        patientId,
        doctorId,
        ClinicalReportType.INITIAL_INTAKE,
        report,
      );

      return { report, reportId: saved.id };
    } catch (error) {
      console.error('Report Generation Error:', error);
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  async generateFinalReport(
    patientId: string,
    doctorId: string,
  ): Promise<{ report: string; reportId: string }> {
    const plan = await this.treatmentService.validateFinalReportEligible(patientId);
    const fullTranscript =
      await this.treatmentService.getFullTreatmentTranscript(patientId);

    if (!this.geminiService.isConfigured()) {
      throw new InternalServerErrorException('AI Service not configured');
    }

    try {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const prompt = `
You are a senior clinical psychiatrist. Review the full treatment transcript and write a final clinical report.

Required sections (use ## headings exactly like these titles):
## Executive Summary
## Intake Assessment Findings
## Section-by-Section Breakdown
## Overall Progress and Changes Observed
## Remaining Risk Factors
## Recommended Follow-up and Maintenance Plan

Formatting rules for clean PDF rendering:
- Use real calendar date "${today}" — never write placeholders like [Current Date]
- Use ### for each therapeutic module under Section-by-Section Breakdown
- Use "- " bullet lists; keep each bullet on one line as: - **Label:** description
- Use numbered lists only for follow-up steps
- Prefer short paragraphs; avoid tables and nested lists deeper than one level
- Do not invent clinical facts not supported by the transcript
- Output markdown only — no preamble or closing remarks

FULL TREATMENT TRANSCRIPT:
${fullTranscript}
`;

      const report = await this.callAI(prompt, patientId);
      const saved = await this.treatmentService.saveReport(
        plan.id,
        patientId,
        doctorId,
        ClinicalReportType.FINAL_COMPREHENSIVE,
        report,
      );

      return { report, reportId: saved.id };
    } catch (error) {
      console.error('Final Report Generation Error:', error);
      throw new InternalServerErrorException('Failed to generate final report');
    }
  }

  private async callAI(prompt: string, patientId: string): Promise<string> {
    const result = await this.geminiService.generateText({
      maxOutputTokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    await this.aiUsageService.recordUsage(
      patientId,
      result.inputTokens,
      result.outputTokens,
    );

    return result.text;
  }

  async generateInitialReportPDF(patientId: string, doctorId: string): Promise<Buffer> {
    const reports = await this.treatmentService.getPatientReports(patientId);
    const latest = reports.find(
      (r) => r.reportType === ClinicalReportType.INITIAL_INTAKE,
    );

    const report = latest
      ? latest.content
      : (await this.generateInitialReport(patientId, doctorId)).report;

    return renderMarkdownToPdf(report, {
      title: 'Intake Clinical Summary',
      subtitle: 'AI-assisted clinical documentation',
      reportId: latest?.id,
    });
  }

  async generateFinalReportPDF(patientId: string, doctorId: string): Promise<Buffer> {
    const reports = await this.treatmentService.getPatientReports(patientId);
    const latest = reports.find(
      (r) => r.reportType === ClinicalReportType.FINAL_COMPREHENSIVE,
    );

    const report = latest
      ? latest.content
      : (await this.generateFinalReport(patientId, doctorId)).report;

    return renderMarkdownToPdf(report, {
      title: 'Comprehensive Treatment Report',
      subtitle: 'AI-assisted clinical documentation',
      reportId: latest?.id,
    });
  }
}
