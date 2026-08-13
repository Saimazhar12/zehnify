import api from '../utils/api';
import { DoctorPatient, NotificationItem, PatientTreatmentDetail, SectionAssignment } from '../types';

export const doctorService = {
  async getPatients(): Promise<DoctorPatient[]> {
    const response = await api.get<DoctorPatient[]>('/doctor/patients');
    return response.data;
  },

  async getPatientTreatment(userId: string): Promise<PatientTreatmentDetail> {
    const response = await api.get<PatientTreatmentDetail>(`/doctor/patients/${userId}/treatment`);
    return response.data;
  },

  async assignSections(
    userId: string,
    sections: Array<{ sectionType: number; sortOrder: number; doctorNotes?: string }>,
  ): Promise<SectionAssignment[]> {
    const response = await api.post<SectionAssignment[]>(
      `/doctor/patients/${userId}/assign-sections`,
      { sections },
    );
    return response.data;
  },

  async getPatientReports(userId: string) {
    const response = await api.get(`/doctor/patients/${userId}/reports`);
    return response.data;
  },

  async sendNotification(
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
