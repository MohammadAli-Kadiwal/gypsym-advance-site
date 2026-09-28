import { api } from '@/lib/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
  requiresTwoFactor?: boolean;
}

export const authService = {
  /**
   * Enterprise admin login
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', payload, { skipAuth: true });
  },

  /**
   * Enterprise admin logout
   */
  async logout(): Promise<void> {
    return api.post<void>('/auth/logout');
  },

  /**
   * Validate token and fetch current authenticated admin user profile
   */
  async getMe(): Promise<any> {
    return api.get<any>('/auth/me');
  },

  /**
   * Security settings (Rate limits, lockout thresholds, max payload)
   */
  async getSecuritySettings(): Promise<any> {
    return api.get<any>('/auth/security-settings');
  },

  async updateSecuritySettings(data: any): Promise<any> {
    return api.patch<any>('/auth/security-settings', data);
  },

  /**
   * Blocked IPs management
   */
  async getBlockedIps(): Promise<any[]> {
    return api.get<any[]>('/auth/blocked-ips');
  },

  async unblockIp(ip: string): Promise<any> {
    return api.post<any>('/auth/unblock-ip', { ip });
  },
};
