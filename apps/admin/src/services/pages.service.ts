import { api } from '@/lib/api';

export const pagesService = {
  async getAll(): Promise<any[]> {
    return api.get<any[]>('/pages');
  },

  async getBySlug(slug: string): Promise<any> {
    return api.get<any>(`/pages/${slug}`);
  },

  async create(data: any): Promise<any> {
    return api.post<any>('/pages', data);
  },

  async update(slug: string, data: any): Promise<any> {
    return api.patch<any>(`/pages/${slug}`, data);
  },

  async delete(slug: string): Promise<any> {
    return api.delete<any>(`/pages/${slug}`);
  },

  async reorderSections(slug: string, sectionIds: string[]): Promise<any> {
    return api.post<any>(`/pages/${slug}/sections/reorder`, { sectionIds });
  },

  async saveSection(slug: string, sectionData: any): Promise<any> {
    return api.post<any>(`/pages/${slug}/sections`, sectionData);
  },
};
