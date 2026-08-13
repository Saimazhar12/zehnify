import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { TreatmentService } from '../treatment/treatment.service';
import { AiUsageService } from '../ai/ai-usage.service';
import { GeminiService } from '../ai/gemini.service';

jest.mock('./markdown-pdf.renderer', () => ({
  renderMarkdownToPdf: jest.fn(),
}));

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: TreatmentService,
          useValue: {},
        },
        {
          provide: AiUsageService,
          useValue: {
            recordUsage: jest.fn(),
          },
        },
        {
          provide: GeminiService,
          useValue: {
            isConfigured: jest.fn(),
            generateText: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
