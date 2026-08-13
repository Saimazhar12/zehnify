import api from '../utils/api';
import { NotificationItem } from '../types';

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    const response = await api.get<NotificationItem[]>('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch<NotificationItem>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async sendCustom(
    userId: string,
    payload: { title: string; body: string },
  ): Promise<NotificationItem> {
    const response = await api.post<NotificationItem>(
      `/doctor/patients/${userId}/notifications`,
      payload,
    );
    return response.data;
  },
};
