import { api } from '@/lib/api';

export interface PublicRecaptchaConfig {
  enabled: boolean;
  siteKey: string | null;
}

export const recaptchaService = {
  /**
   * Fetch active reCAPTCHA site configuration from backend
   */
  async getConfig(): Promise<PublicRecaptchaConfig> {
    const res: any = await api.get('/settings/recaptcha');
    return {
      enabled: res?.enabled === true && Boolean(res?.siteKey),
      siteKey: res?.siteKey || null,
    };
  },

  /**
   * Fetch public site key for frontend widget mounting
   */
  async getPublicConfig(): Promise<PublicRecaptchaConfig> {
    const res: any = await api.get('/settings/recaptcha/public');
    const data = res?.data || res;
    return {
      enabled: Boolean(data?.enabled && data?.siteKey),
      siteKey: data?.siteKey || null,
    };
  },
};
