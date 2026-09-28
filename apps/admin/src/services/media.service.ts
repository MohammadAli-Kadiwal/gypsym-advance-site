import { api } from '@/lib/api';

export const mediaService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/media');
  },

  async upload(file: File, onProgress?: (percent: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<any>('/media/upload', formData, onProgress);
  },

  async delete(id: string): Promise<any> {
    return api.delete<any>(`/media/${id}`);
  },
};
