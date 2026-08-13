import api from '../utils/api';
import { Chat, ChatMessage } from '../types';

export const chatService = {
  async sendMessage(content: string, type: number, chatId?: string) {
    const response = await api.post<{
      chatId: string;
      userMessage: ChatMessage;
      aiMessage: ChatMessage;
    }>('/chat/message', {
      content,
      type,
      chatId,
    });
    return response.data;
  },

  async getChatHistory(options?: { type?: number; chatId?: string; treatmentPlanId?: string }) {
    const params = new URLSearchParams();
    if (options?.type) params.set('type', String(options.type));
    if (options?.chatId) params.set('chatId', options.chatId);
    if (options?.treatmentPlanId) params.set('treatmentPlanId', options.treatmentPlanId);
    const query = params.toString();
    const response = await api.get<Chat[]>(`/chat/history${query ? `?${query}` : ''}`);
    return response.data;
  },
};
