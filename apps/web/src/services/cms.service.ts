import { api } from '@/lib/api';

export const cmsService = {
  /**
   * Fetch page by slug from NestJS CMS API
   */
  async getPage(slug: string): Promise<any> {
    return api.get(`/pages/${encodeURIComponent(slug)}`);
  },

  /**
   * Fetch live dynamic header data
   */
  async getHeader(): Promise<any> {
    return api.get('/header');
  },

  /**
   * Fetch live dynamic footer data
   */
  async getFooter(): Promise<any> {
    return api.get('/footer');
  },

  /**
   * Fetch active brand settings
   */
  async getBranding(): Promise<any> {
    return api.get('/branding');
  },

  /**
   * Fetch site settings
   */
  async getSettings(): Promise<any> {
    return api.get('/settings');
  },

  /**
   * Fetch scripts configuration
   */
  async getScripts(): Promise<any> {
    return api.get('/settings/scripts');
  },
};
