import api from '../utils/api';
import { EmotionSnapshot, MoodAnalyzeResult, MoodSummary, MoodInsights, PatientChatMoodSummary } from '../types';

export const moodService = {
  async analyzeFrame(chatId: string, blob: Blob): Promise<MoodAnalyzeResult> {
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    formData.append('chatId', chatId);

    const response = await api.post<MoodAnalyzeResult>('/mood/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getChatSnapshots(chatId: string): Promise<EmotionSnapshot[]> {
    const response = await api.get<EmotionSnapshot[]>(`/mood/chat/${chatId}`);
    return response.data;
  },

  async getChatMoodSummary(chatId: string): Promise<MoodSummary> {
    const response = await api.get<MoodSummary>(`/mood/chat/${chatId}/summary`);
    return response.data;
  },

  async getPatientMoodSummaries(userId: string): Promise<PatientChatMoodSummary[]> {
    const response = await api.get<PatientChatMoodSummary[]>(`/mood/patient/${userId}/summary`);
    return response.data;
  },

  async getPatientInsights(userId: string): Promise<MoodInsights> {
    const response = await api.get<MoodInsights>(`/mood/patient/${userId}/insights`);
    return response.data;
  },
};
