import { api } from '@/lib/api';

export const blogService = {
  // Posts
  async getPosts(params?: { category?: string; search?: string; limit?: number }): Promise<any> {
    return api.get<any>('/blog', params);
  },

  async getPostById(id: string): Promise<any> {
    return api.get<any>(`/blog/${id}`);
  },

  async createPost(data: any): Promise<any> {
    return api.post<any>('/blog', data);
  },

  async updatePost(id: string, data: any): Promise<any> {
    return api.patch<any>(`/blog/${id}`, data);
  },

  async deletePost(id: string): Promise<any> {
    return api.delete<any>(`/blog/${id}`);
  },

  // Categories
  async getCategories(): Promise<any[]> {
    return api.get<any[]>('/blog/categories');
  },

  async createCategory(data: any): Promise<any> {
    return api.post<any>('/blog/categories', data);
  },

  async updateCategory(id: string, data: any): Promise<any> {
    return api.patch<any>(`/blog/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<any> {
    return api.delete<any>(`/blog/categories/${id}`);
  },
};
