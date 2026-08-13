import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmotionSnapshot } from './entities/emotion-snapshot.entity';
import { Chat } from '../chat/entities/chat.entity';
import {
  MOOD_SNAPSHOT_LIMIT_PER_CHAT,
  MOOD_API_COOLDOWN_RETRY_MS,
} from './constants';
import { getMoodApiUrl } from '../common/constants/app-urls';

class MoodApiCooldownError extends Error {
  constructor() {
    super('Mood API on cooldown');
    this.name = 'MoodApiCooldownError';
  }
}

interface HfEmotionResponse {
  accepted: boolean;
  reason: string;
  prediction: string | null;
  confidence: number | null;
  all_emotions: Record<string, number> | null;
}

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(EmotionSnapshot)
    private readonly snapshotRepository: Repository<EmotionSnapshot>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly configService: ConfigService,
  ) {}

  async analyzeFrame(
    userId: string,
    chatId: string,
    file: Express.Multer.File,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found.');
    }

    const acceptedCount = await this.getAcceptedCount(chatId);

    if (acceptedCount >= MOOD_SNAPSHOT_LIMIT_PER_CHAT) {
      return {
        capped: true,
        cooldown: false,
        scansUsed: acceptedCount,
        scansLimit: MOOD_SNAPSHOT_LIMIT_PER_CHAT,
        snapshot: null,
      };
    }

    let hfResult: HfEmotionResponse;
    try {
      hfResult = await this.callHfApi(file);
    } catch (error) {
      if (error instanceof MoodApiCooldownError) {
        return {
          capped: false,
          cooldown: true,
          retryAfterMs: MOOD_API_COOLDOWN_RETRY_MS,
          scansUsed: acceptedCount,
          scansLimit: MOOD_SNAPSHOT_LIMIT_PER_CHAT,
          snapshot: null,
        };
      }
      throw error;
    }

    const sequenceNumber = hfResult.accepted
      ? acceptedCount + 1
      : null;

    const snapshot = this.snapshotRepository.create({
      userId,
      chatId,
      treatmentPlanId: chat.treatmentPlanId,
      sectionAssignmentId: chat.sectionAssignmentId,
      accepted: hfResult.accepted,
      reason: hfResult.reason,
      prediction: hfResult.prediction,
      confidence: hfResult.confidence,
      allEmotions: hfResult.all_emotions,
      sequenceNumber,
    });

    const saved = await this.snapshotRepository.save(snapshot);

    const scansUsed = hfResult.accepted
      ? acceptedCount + 1
      : acceptedCount;

    return {
      capped: false,
      cooldown: false,
      scansUsed,
      scansLimit: MOOD_SNAPSHOT_LIMIT_PER_CHAT,
      snapshot: this.toSnapshotResponse(saved),
    };
  }

  async getChatSnapshots(userId: string, chatId: string) {
    await this.assertChatOwnership(userId, chatId);

    const snapshots = await this.snapshotRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });

    return snapshots.map((s) => this.toSnapshotResponse(s));
  }

  async getChatSummary(userId: string, chatId: string) {
    await this.assertChatOwnership(userId, chatId);
    return this.buildChatSummary(chatId);
  }

  async getChatSnapshotsByChatId(chatId: string) {
    await this.assertChatExists(chatId);

    const snapshots = await this.snapshotRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });

    return snapshots.map((s) => this.toSnapshotResponse(s));
  }

  async getChatSummaryByChatId(chatId: string) {
    await this.assertChatExists(chatId);
    return this.buildChatSummary(chatId);
  }

  async getPatientSummaries(patientId: string) {
    const chats = await this.chatRepository.find({
      where: { userId: patientId },
      order: { createdAt: 'ASC' },
    });

    const summaries = await Promise.all(
      chats.map(async (chat) => {
        const summary = await this.buildChatSummary(chat.id);
        return {
          chatId: chat.id,
          chatType: chat.type,
          chatTitle: chat.title,
          chatStatus: chat.status,
          ...summary,
        };
      }),
    );

    return summaries.filter((s) => s.acceptedCount > 0 || s.totalAttempts > 0);
  }

  async getUserInsights(userId: string) {
    const chats = await this.chatRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const sessions: Array<{
      chatId: string;
      chatTitle: string;
      chatType: number;
      chatStatus: string;
      startedAt: Date;
      dominantEmotion: string | null;
      happinessScore: number;
      averageConfidence: number | null;
      acceptedCount: number;
      emotionDistribution: Record<string, number>;
      averageEmotions: Record<string, number>;
      timeline: Array<{
        scan: number;
        label: string;
        prediction: string | null;
        confidence: number;
        happiness: number | null;
        neutral: number | null;
        sad: number | null;
        angry: number | null;
        createdAt: Date;
      }>;
    }> = [];

    const allAccepted: EmotionSnapshot[] = [];

    for (const chat of chats) {
      const snapshots = await this.snapshotRepository.find({
        where: { chatId: chat.id },
        order: { createdAt: 'ASC' },
      });
      const accepted = snapshots.filter((s) => s.accepted);
      if (accepted.length === 0) continue;

      allAccepted.push(...accepted);
      const summary = await this.buildChatSummary(chat.id);

      sessions.push({
        chatId: chat.id,
        chatTitle: chat.title,
        chatType: chat.type,
        chatStatus: chat.status,
        startedAt: chat.createdAt,
        dominantEmotion: summary.dominantEmotion,
        happinessScore: this.computeHappinessScore(accepted),
        averageConfidence: summary.averageConfidence,
        acceptedCount: summary.acceptedCount,
        emotionDistribution: summary.emotionDistribution,
        averageEmotions: summary.averageEmotions,
        timeline: accepted.map((snap, index) => ({
          scan: snap.sequenceNumber ?? index + 1,
          label: `Scan ${snap.sequenceNumber ?? index + 1}`,
          prediction: snap.prediction,
          confidence: Math.round(Number(snap.confidence ?? 0) * 100),
          happiness: this.emotionPercent(snap.allEmotions, 'happy'),
          neutral: this.emotionPercent(snap.allEmotions, 'neutral'),
          sad: this.emotionPercent(snap.allEmotions, 'sad'),
          angry: this.emotionPercent(snap.allEmotions, 'angry'),
          createdAt: snap.createdAt,
        })),
      });
    }

    const overallEmotionTotals: Record<string, number> = {};
    for (const snap of allAccepted) {
      if (snap.prediction) {
        overallEmotionTotals[snap.prediction] =
          (overallEmotionTotals[snap.prediction] ?? 0) + 1;
      }
    }

    const dominantEmotion =
      Object.entries(overallEmotionTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      null;

    const confidenceSum = allAccepted.reduce(
      (sum, snap) => sum + Number(snap.confidence ?? 0),
      0,
    );

    return {
      overall: {
        totalScans: allAccepted.length,
        totalSessions: sessions.length,
        dominantEmotion,
        happinessScore: this.computeHappinessScore(allAccepted),
        averageConfidence:
          allAccepted.length > 0
            ? Math.round((confidenceSum / allAccepted.length) * 100)
            : null,
        emotionDistribution: overallEmotionTotals,
      },
      sessions,
    };
  }

  private computeHappinessScore(snapshots: EmotionSnapshot[]): number {
    const happyScores = snapshots
      .map((snap) => snap.allEmotions?.happy)
      .filter((value): value is number => value != null);

    if (happyScores.length === 0) return 0;
    const avg = happyScores.reduce((sum, value) => sum + value, 0) / happyScores.length;
    return Math.round(avg * 100);
  }

  private emotionPercent(
    emotions: Record<string, number> | null,
    key: string,
  ): number | null {
    if (!emotions || emotions[key] == null) return null;
    return Math.round(emotions[key] * 100);
  }

  private async buildChatSummary(chatId: string) {
    const snapshots = await this.snapshotRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });

    const accepted = snapshots.filter((s) => s.accepted);
    const emotionTotals: Record<string, number> = {};
    let confidenceSum = 0;

    for (const snap of accepted) {
      confidenceSum += Number(snap.confidence ?? 0);
      if (snap.prediction) {
        emotionTotals[snap.prediction] =
          (emotionTotals[snap.prediction] ?? 0) + 1;
      }
    }

    const dominantEmotion =
      Object.entries(emotionTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      null;

    const avgEmotions: Record<string, number> = {};
    if (accepted.length > 0) {
      const keys = new Set<string>();
      accepted.forEach((s) => {
        if (s.allEmotions) {
          Object.keys(s.allEmotions).forEach((k) => keys.add(k));
        }
      });

      keys.forEach((key) => {
        const sum = accepted.reduce(
          (acc, s) => acc + (s.allEmotions?.[key] ?? 0),
          0,
        );
        avgEmotions[key] = Math.round((sum / accepted.length) * 10000) / 10000;
      });
    }

    return {
      acceptedCount: accepted.length,
      totalAttempts: snapshots.length,
      scansLimit: MOOD_SNAPSHOT_LIMIT_PER_CHAT,
      dominantEmotion,
      averageConfidence:
        accepted.length > 0
          ? Math.round((confidenceSum / accepted.length) * 10000) / 10000
          : null,
      emotionDistribution: emotionTotals,
      averageEmotions: avgEmotions,
      latestSnapshot: accepted.length
        ? this.toSnapshotResponse(accepted[accepted.length - 1])
        : null,
    };
  }

  private async callHfApi(file: Express.Multer.File): Promise<HfEmotionResponse> {
    const apiUrl = getMoodApiUrl(this.configService);

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });
    formData.append('file', blob, file.originalname || 'frame.jpg');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      const bodyText = await response.text();

      if (!response.ok) {
        if (this.isCooldownResponse(response.status, bodyText)) {
          throw new MoodApiCooldownError();
        }
        throw new ServiceUnavailableException(
          'Emotion analysis service is unavailable.',
        );
      }

      try {
        return JSON.parse(bodyText) as HfEmotionResponse;
      } catch {
        if (this.isCooldownResponse(response.status, bodyText)) {
          throw new MoodApiCooldownError();
        }
        throw new ServiceUnavailableException(
          'Emotion analysis service returned an invalid response.',
        );
      }
    } catch (error) {
      if (error instanceof MoodApiCooldownError) {
        throw error;
      }
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      console.error('HF Emotion API Error:', error);
      throw new MoodApiCooldownError();
    }
  }

  private isCooldownResponse(status: number, body: string): boolean {
    if ([429, 502, 503, 504].includes(status)) {
      return true;
    }
    const lower = body.toLowerCase();
    return ['cooldown', 'queue', 'building', 'sleeping', 'loading', 'starting'].some(
      (keyword) => lower.includes(keyword),
    );
  }

  private async getAcceptedCount(chatId: string): Promise<number> {
    return this.snapshotRepository.count({
      where: { chatId, accepted: true },
    });
  }

  private async assertChatOwnership(userId: string, chatId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found.');
    }

    return chat;
  }

  private async assertChatExists(chatId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found.');
    }

    return chat;
  }

  private toSnapshotResponse(snapshot: EmotionSnapshot) {
    return {
      id: snapshot.id,
      chatId: snapshot.chatId,
      accepted: snapshot.accepted,
      reason: snapshot.reason,
      prediction: snapshot.prediction,
      confidence: snapshot.confidence ? Number(snapshot.confidence) : null,
      allEmotions: snapshot.allEmotions,
      sequenceNumber: snapshot.sequenceNumber,
      createdAt: snapshot.createdAt,
    };
  }
}
