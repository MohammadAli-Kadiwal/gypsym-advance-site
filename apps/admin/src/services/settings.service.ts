import { api } from '@/lib/api';

export const settingsService = {
  // General site settings
  async getGeneral(): Promise<Record<string, any>> {
    return api.get<Record<string, any>>('/settings');
  },

  async updateGeneral(data: Record<string, any>): Promise<any> {
    return api.patch<any>('/settings', data);
  },

  // Branding
  async getBranding(): Promise<any> {
    return api.get<any>('/branding');
  },

  async updateBranding(data: any): Promise<any> {
    return api.patch<any>('/branding', data);
  },

  // SEO
  async getSeo(): Promise<any> {
    return api.get<any>('/settings/seo');
  },

  async updateSeo(data: any): Promise<any> {
    return api.post<any>('/settings/seo', data);
  },

  // Custom Scripts
  async getScripts(): Promise<any> {
    return api.get<any>('/settings/scripts');
  },

  async updateScripts(data: any): Promise<any> {
    return api.post<any>('/settings/scripts', data);
  },

  // reCAPTCHA
  async getRecaptcha(): Promise<any> {
    return api.get<any>('/settings/recaptcha');
  },

  async updateRecaptcha(data: any): Promise<any> {
    return api.patch<any>('/settings/recaptcha', data);
  },

  async testRecaptcha(data: any): Promise<any> {
    return api.post<any>('/settings/recaptcha/test', data);
  },

  // SMTP
  async getSmtp(): Promise<any> {
    return api.get<any>('/settings/smtp');
  },

  async updateSmtp(data: any): Promise<any> {
    return api.patch<any>('/settings/smtp', data);
  },

  async testSmtp(toEmail: string): Promise<any> {
    return api.post<any>('/settings/smtp/test', { toEmail });
  },

  // Email Templates
  async getEmailTemplates(): Promise<any[]> {
    return api.get<any[]>('/settings/email-templates');
  },

  async getEmailTemplate(key: string): Promise<any> {
    return api.get<any>(`/settings/email-templates/${key}`);
  },

  async updateEmailTemplate(key: string, data: any): Promise<any> {
    return api.patch<any>(`/settings/email-templates/${key}`, data);
  },

  async testEmailTemplate(key: string, recipientEmail: string): Promise<any> {
    return api.post<any>(`/settings/email-templates/${key}/test`, { recipientEmail });
  },

  // Socials
  async getSocials(): Promise<any[]> {
    return api.get<any[]>('/socials');
  },

  async updateSocials(socials: any[]): Promise<any> {
    return api.post<any>('/socials', { socials });
  },

  // Header & Footer
  async getHeader(): Promise<any> {
    return api.get<any>('/header');
  },

  async updateHeader(data: any): Promise<any> {
    return api.patch<any>('/header', data);
  },

  async getFooter(): Promise<any> {
    return api.get<any>('/footer');
  },

  async updateFooter(data: any): Promise<any> {
    return api.patch<any>('/footer', data);
  },
};
