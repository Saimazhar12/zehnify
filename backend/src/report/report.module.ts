import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { TreatmentModule } from '../treatment/treatment.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TreatmentModule, AiModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
