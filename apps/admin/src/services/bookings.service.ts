import { api } from '@/lib/api';

export const bookingsService = {
  async getAll(params?: { limit?: number; status?: string }): Promise<any> {
    return api.get<any>('/bookings', params);
  },

  async updateStatus(id: string, status: string): Promise<any> {
    return api.patch<any>(`/bookings/${id}/status`, { status });
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/bookings/${id}`);
  },
};
