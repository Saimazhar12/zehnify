import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message, MessageSender } from './entities/message.entity';
import { ConfigService } from '@nestjs/config';
import { ChatType, getUserMessageLimit, getSessionCompleteMessage } from './constants/chat-type.enum';
import { ChatStatus } from './constants/chat-status.enum';
import { getSystemPrompt } from './prompts';
import { TreatmentService } from '../treatment/treatment.service';
import { AiUsageService } from '../ai/ai-usage.service';
import { GeminiService } from '../ai/gemini.service';
import { getUserInputMaxLength } from '../common/pipes/user-input-max-length.pipe';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private configService: ConfigService,
    private dataSource: DataSource,
    private treatmentService: TreatmentService,
    private aiUsageService: AiUsageService,
    private geminiService: GeminiService,
  ) {}

  async sendMessage(
    userId: string,
    chatId: string | undefined,
    type: number,
    content: string,
  ): Promise<any> {
    const maxInputLength = getUserInputMaxLength(this.configService);
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new BadRequestException('Content is required');
    }
    if (trimmedContent.length > maxInputLength) {
      throw new BadRequestException(
        `Message must be at most ${maxInputLength} characters.`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      let chat: Chat;

      if (chatId) {
        const foundChat = await manager.findOne(Chat, {
          where: { id: chatId, userId },
          relations: ['messages'],
        });
        if (!foundChat) throw new NotFoundException('Chat not found');
        chat = foundChat;
      } else {
        if (type !== ChatType.INTAKE_ASSESSMENT as number) {
          throw new BadRequestException(
            'New chats can only be started for intake assessment (type 1). Use /treatment/assignments/:id/start for assigned sections.',
          );
        }

        const plan = await this.treatmentService.getOrCreateActivePlan(userId);
        const intakeChat = await this.treatmentService.ensureIntakeChat(
          plan,
          userId,
        );
        const loadedChat = await manager.findOne(Chat, {
          where: { id: intakeChat.id, userId },
          relations: ['messages'],
        });
        if (!loadedChat) throw new NotFoundException('Intake chat not found');
        chat = loadedChat;
      }

      const userMessageCount = this.treatmentService.countUserMessages(
        chat.messages ?? [],
      );

      await this.treatmentService.validateMessageAllowed(
        userId,
        chat,
        userMessageCount,
      );

      const limit = getUserMessageLimit(chat.type);
      const isFinalMessage = userMessageCount + 1 >= limit;

      let responseText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      if (isFinalMessage) {
        responseText = getSessionCompleteMessage(chat.type);
      } else {
        if (!this.geminiService.isConfigured()) {
          throw new InternalServerErrorException('AI Service not configured');
        }

        try {
          const history = (chat.messages ?? []).map((m) => ({
            role:
              m.sender === MessageSender.USER
                ? ('user' as const)
                : ('model' as const),
            content: m.content,
          }));

          const systemInstruction = getSystemPrompt(chat.type);

          const result = await this.geminiService.generateText({
            systemInstruction: systemInstruction || undefined,
            maxOutputTokens: 1024,
            messages: [
              ...history,
              { role: 'user', content: trimmedContent },
            ],
          });

          inputTokens = result.inputTokens;
          outputTokens = result.outputTokens;
          responseText = result.text;
        } catch (error) {
          console.error('Gemini API Error:', error);
          throw new ServiceUnavailableException(
            'I am having trouble connecting to the AI right now.',
          );
        }
      }

      const userMessage = manager.create(Message, {
        chatId: chat.id,
        sender: MessageSender.USER,
        content: trimmedContent,
      });
      await manager.save(Message, userMessage);

      const aiMessage = manager.create(Message, {
        chatId: chat.id,
        sender: MessageSender.AI,
        content: responseText,
      });
      await manager.save(Message, aiMessage);

      const aiUsage = await this.aiUsageService.recordUsage(
        userId,
        inputTokens,
        outputTokens,
      );

      const newUserMessageCount = userMessageCount + 1;
      const completion = await this.treatmentService.handleMessageComplete(
        chat,
        newUserMessageCount,
        manager,
      );

      return {
        chatId: chat.id,
        userMessage,
        aiMessage,
        messagesRemaining: completion.messagesRemaining,
        userMessageCount: newUserMessageCount,
        messageLimit: limit,
        chatStatus:
          newUserMessageCount >= limit ? ChatStatus.COMPLETED : chat.status,
        sectionStatus: completion.sectionStatus,
        planStatus: completion.planStatus,
        aiUsage,
      };
    });
  }

  async getUserChats(
    userId: string,
    type?: number,
    treatmentPlanId?: string,
    chatId?: string,
  ): Promise<Chat[]> {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.userId = :userId', { userId })
      .leftJoinAndSelect('chat.messages', 'messages')
      .orderBy('chat.createdAt', 'DESC')
      .addOrderBy('messages.createdAt', 'ASC');

    if (chatId) {
      query.andWhere('chat.id = :chatId', { chatId });
    }

    if (type) {
      query.andWhere('chat.type = :type', { type });
    }

    if (treatmentPlanId) {
      query.andWhere('chat.treatmentPlanId = :treatmentPlanId', {
        treatmentPlanId,
      });
    }

    return query.getMany();
  }
}
