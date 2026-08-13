import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiTextResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('AI_KEY');

    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.model =
      this.configService.get<string>('GEMINI_MODEL') ||
      'gemini-3.5-flash-lite';
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateText(options: {
    messages: GeminiMessage[];
    systemInstruction?: string;
    maxOutputTokens: number;
  }): Promise<GeminiTextResult> {
    if (!this.client) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const contents: Content[] = options.messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: options.systemInstruction,
        maxOutputTokens: options.maxOutputTokens,
      },
    });

    return {
      text: response.text?.trim() ?? '',
      inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}
