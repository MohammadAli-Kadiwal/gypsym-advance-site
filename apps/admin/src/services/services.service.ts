import { api } from '@/lib/api';

export const servicesService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/services');
  },

  async getById(id: string): Promise<any> {
    return api.get<any>(`/services/${id}`);
  },

  async create(data: any): Promise<any> {
    return api.post<any>('/services', data);
  },

  async update(id: string, data: any): Promise<any> {
    return api.patch<any>(`/services/${id}`, data);
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/services/${id}`);
  },
};
