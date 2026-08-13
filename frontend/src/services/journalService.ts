import api from '../utils/api';

export interface JournalNote {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const journalService = {
  async getNotes(): Promise<JournalNote[]> {
    const response = await api.get<JournalNote[]>('/journal/notes');
    return response.data;
  },

  async createNote(title: string, content: string): Promise<JournalNote> {
    const response = await api.post<JournalNote>('/journal/notes', { title, content });
    return response.data;
  },

  async updateNote(
    noteId: string,
    data: { title?: string; content?: string },
  ): Promise<JournalNote> {
    const response = await api.patch<JournalNote>(`/journal/notes/${noteId}`, data);
    return response.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await api.delete(`/journal/notes/${noteId}`);
  },
};
