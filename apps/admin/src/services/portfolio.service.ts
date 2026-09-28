import { api } from '@/lib/api';

export const portfolioService = {
  // Projects
  async getProjects(params?: { category?: string; status?: string }): Promise<any> {
    return api.get<any>('/portfolio', params);
  },

  async getProjectById(id: string): Promise<any> {
    return api.get<any>(`/portfolio/${id}`);
  },

  async createProject(data: any): Promise<any> {
    return api.post<any>('/portfolio', data);
  },

  async updateProject(id: string, data: any): Promise<any> {
    return api.patch<any>(`/portfolio/${id}`, data);
  },

  async deleteProject(id: string): Promise<any> {
    return api.delete<any>(`/portfolio/${id}`);
  },

  // Categories
  async getCategories(): Promise<any[]> {
    return api.get<any[]>('/portfolio/categories');
  },

  async createCategory(data: any): Promise<any> {
    return api.post<any>('/portfolio/categories', data);
  },

  async updateCategory(id: string, data: any): Promise<any> {
    return api.patch<any>(`/portfolio/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<any> {
    return api.delete<any>(`/portfolio/categories/${id}`);
  },
};
