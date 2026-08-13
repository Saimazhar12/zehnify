import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import {
  AiUsageSummary,
  EMPTY_AI_USAGE,
  UserAiUsage,
} from './types/ai-usage.types';

@Injectable()
export class AiUsageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  getRates() {
    return {
      inputPerMTok: parseFloat(
        this.configService.get<string>('AI_INPUT_COST_PER_MTOK') || '0.3',
      ),
      outputPerMTok: parseFloat(
        this.configService.get<string>('AI_OUTPUT_COST_PER_MTOK') || '2.5',
      ),
    };
  }

  calculateCosts(inputTokens: number, outputTokens: number) {
    const rates = this.getRates();
    const inputCost = (inputTokens / 1_000_000) * rates.inputPerMTok;
    const outputCost = (outputTokens / 1_000_000) * rates.outputPerMTok;
    const total = inputCost + outputCost;

    return {
      inputCost: this.roundUsd(inputCost),
      outputCost: this.roundUsd(outputCost),
      totalCost: this.roundUsd(total),
      rates,
    };
  }

  normalizeUsage(raw: UserAiUsage | null | undefined): UserAiUsage {
    if (!raw?.tokens || !raw?.costs) {
      const rates = this.getRates();
      return {
        tokens: { input: 0, output: 0 },
        costs: { input: 0, output: 0, total: 0 },
        rates,
      };
    }

    return {
      tokens: {
        input: raw.tokens.input ?? 0,
        output: raw.tokens.output ?? 0,
      },
      costs: {
        input: raw.costs.input ?? 0,
        output: raw.costs.output ?? 0,
        total: raw.costs.total ?? 0,
      },
      rates: raw.rates ?? this.getRates(),
    };
  }

  toSummary(raw: UserAiUsage | null | undefined): AiUsageSummary {
    const usage = this.normalizeUsage(raw);
    const rates = this.getRates();

    return {
      tokens: usage.tokens,
      costs: usage.costs,
      rates,
    };
  }

  async recordUsage(
    userId: string,
    inputTokens: number,
    outputTokens: number,
  ): Promise<AiUsageSummary> {
    if (inputTokens <= 0 && outputTokens <= 0) {
      return this.getUserUsage(userId);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return this.toSummary(EMPTY_AI_USAGE);
    }

    const current = this.normalizeUsage(user.aiUsage);
    const delta = this.calculateCosts(inputTokens, outputTokens);

    const updated: UserAiUsage = {
      tokens: {
        input: current.tokens.input + inputTokens,
        output: current.tokens.output + outputTokens,
      },
      costs: {
        input: this.roundUsd(current.costs.input + delta.inputCost),
        output: this.roundUsd(current.costs.output + delta.outputCost),
        total: this.roundUsd(current.costs.total + delta.totalCost),
      },
      rates: delta.rates,
    };

    user.aiUsage = updated;
    await this.userRepository.save(user);

    return this.toSummary(updated);
  }

  async getUserUsage(userId: string): Promise<AiUsageSummary> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return this.toSummary(user?.aiUsage);
  }

  private roundUsd(value: number): number {
    return Math.round(value * 1_000_000) / 1_000_000;
  }
}
