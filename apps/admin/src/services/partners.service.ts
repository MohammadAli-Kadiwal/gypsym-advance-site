import { api } from '@/lib/api';

export const partnersService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/partners');
  },

  async create(data: any): Promise<any> {
    return api.post<any>('/partners', data);
  },

  async update(id: string, data: any): Promise<any> {
    return api.patch<any>(`/partners/${id}`, data);
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/partners/${id}`);
  },
};
