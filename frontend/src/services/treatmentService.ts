import api from '../utils/api';
import { TreatmentStatus, SectionAssignment } from '../types';
import { Chat } from '../types';

export const treatmentService = {
  async getStatus(): Promise<TreatmentStatus> {
    const response = await api.get<TreatmentStatus>('/treatment/status');
    return response.data;
  },

  async getAssignments(): Promise<SectionAssignment[]> {
    const response = await api.get<SectionAssignment[]>('/treatment/assignments');
    return response.data;
  },

  async startAssignment(assignmentId: string): Promise<Chat> {
    const response = await api.post<Chat>(`/treatment/assignments/${assignmentId}/start`);
    return response.data;
  },
};
