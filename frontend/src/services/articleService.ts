import api from '../utils/api';
import { WellnessArticleDetail, WellnessArticleSummary } from '../types';

export interface CreateArticlePayload {
  title: string;
  excerpt: string;
  content: string;
  type?: 'article' | 'guide';
  readTimeMinutes?: number;
  published?: boolean;
}

export const articleService = {
  async getPublished(): Promise<WellnessArticleSummary[]> {
    const response = await api.get<WellnessArticleSummary[]>('/articles');
    return response.data;
  },

  async getById(id: string): Promise<WellnessArticleDetail> {
    const response = await api.get<WellnessArticleDetail>(`/articles/${id}`);
    return response.data;
  },

  async getMine(): Promise<WellnessArticleSummary[]> {
    const response = await api.get<WellnessArticleSummary[]>('/articles/mine');
    return response.data;
  },

  async create(payload: CreateArticlePayload): Promise<WellnessArticleDetail> {
    const response = await api.post<WellnessArticleDetail>('/articles', payload);
    return response.data;
  },

  async update(id: string, payload: Partial<CreateArticlePayload>): Promise<WellnessArticleDetail> {
    const response = await api.patch<WellnessArticleDetail>(`/articles/${id}`, payload);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/articles/${id}`);
  },
};
