import { api } from '@/lib/api';

export const inquiriesService = {
  async getAll(params?: { limit?: number; status?: string }): Promise<any> {
    return api.get<any>('/inquiries', params);
  },

  async getById(id: string): Promise<any> {
    return api.get<any>(`/inquiries/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<any> {
    return api.patch<any>(`/inquiries/${id}/status`, { status });
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/inquiries/${id}`);
  },
};
