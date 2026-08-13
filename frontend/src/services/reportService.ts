import api from '../utils/api';

export const reportService = {
  async generateReport(userId: string) {
    const response = await api.post<{ report: string }>('/report/generate', { userId });
    return response.data.report;
  },

  async generateFinalReport(userId: string) {
    const response = await api.post<{ report: string }>('/report/generate-final', { userId });
    return response.data.report;
  },

  async downloadReport(userId: string, fileName: string) {
    const response = await api.get(`/report/download?userId=${userId}`, {
      responseType: 'blob',
    });
    downloadBlob(response.data, fileName);
  },

  async downloadFinalReport(userId: string, fileName: string) {
    const response = await api.get(`/report/download-final?userId=${userId}`, {
      responseType: 'blob',
    });
    downloadBlob(response.data, fileName);
  },
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
