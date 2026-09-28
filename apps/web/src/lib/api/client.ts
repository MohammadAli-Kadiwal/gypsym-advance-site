import { axiosInstance } from './axios-client';
import type { CustomRequestConfig, QueryParams } from './types';

function serializeParams(params?: QueryParams): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        cleaned[key] = val.join(',');
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

/**
 * Centralized Typed Frontend API Client for Public Web
 */
export const api = {
  async get<T = any>(url: string, params?: QueryParams, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.get(url, {
      ...config,
      params: serializeParams(params),
    });
    return res as unknown as T;
  },

  async post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.post(url, data, config);
    return res as unknown as T;
  },

  async put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.put(url, data, config);
    return res as unknown as T;
  },

  async patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.patch(url, data, config);
    return res as unknown as T;
  },

  async delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.delete(url, config);
    return res as unknown as T;
  },

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void,
    config?: CustomRequestConfig
  ): Promise<T> {
    const res = await axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    } as any);
    return res as unknown as T;
  },

  async request<T = any>(config: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.request(config as any);
    return res as unknown as T;
  },

  createAbortController(): AbortController {
    return new AbortController();
  },
};
