import { api } from '@/lib/api';

export const portfolioService = {
  async getCategories(): Promise<any[]> {
    return api.get<any[]>('/portfolio/categories');
  },

  async getProjects(categorySlug?: string): Promise<any[]> {
    const params = categorySlug && categorySlug !== 'all' ? { category: categorySlug } : undefined;
    const res: any = await api.get('/portfolio', params);
    return res?.projects ?? (Array.isArray(res) ? res : []);
  },
};
