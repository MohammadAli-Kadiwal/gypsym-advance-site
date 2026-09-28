import { api } from '@/lib/api';

export const clientsService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/clients');
  },

  async create(data: any): Promise<any> {
    return api.post<any>('/clients', data);
  },

  async update(id: string, data: any): Promise<any> {
    return api.patch<any>(`/clients/${id}`, data);
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/clients/${id}`);
  },
};
