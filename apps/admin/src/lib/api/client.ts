import { axiosInstance } from './axios-client';
import type { CustomRequestConfig, QueryParams } from './types';

/**
 * Standard query parameter serializer
 */
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
 * Centralized Typed Frontend API Client
 * Used across domain services to communicate with NestJS REST API.
 */
export const api = {
  /**
   * HTTP GET Request
   */
  async get<T = any>(url: string, params?: QueryParams, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.get(url, {
      ...config,
      params: serializeParams(params),
    });
    return res as unknown as T;
  },

  /**
   * HTTP POST Request
   */
  async post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.post(url, data, config);
    return res as unknown as T;
  },

  /**
   * HTTP PUT Request
   */
  async put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.put(url, data, config);
    return res as unknown as T;
  },

  /**
   * HTTP PATCH Request
   */
  async patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.patch(url, data, config);
    return res as unknown as T;
  },

  /**
   * HTTP DELETE Request
   */
  async delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.delete(url, config);
    return res as unknown as T;
  },

  /**
   * Multipart File Upload with Progress Tracking
   */
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

  /**
   * Binary File Download
   */
  async download(url: string, filename?: string, config?: CustomRequestConfig): Promise<Blob> {
    const response = await axiosInstance.get(url, {
      ...config,
      responseType: 'blob',
    } as any);

    const blob = new Blob([response.data || response]);
    if (typeof window !== 'undefined' && filename) {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }
    return blob;
  },

  /**
   * Generic request execution
   */
  async request<T = any>(config: CustomRequestConfig): Promise<T> {
    const res = await axiosInstance.request(config as any);
    return res as unknown as T;
  },

  /**
   * Helper to create standard AbortController for request cancellation
   */
  createAbortController(): AbortController {
    return new AbortController();
  },
};
