import { api } from '@/lib/api';

export const usersService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/users');
  },

  async getById(id: string): Promise<any> {
    return api.get<any>(`/users/${id}`);
  },

  async create(data: any): Promise<any> {
    return api.post<any>('/users', data);
  },

  async update(id: string, data: any): Promise<any> {
    return api.patch<any>(`/users/${id}`, data);
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/users/${id}`);
  },
};
