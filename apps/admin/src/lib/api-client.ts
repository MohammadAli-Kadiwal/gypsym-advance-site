import { api, ApiError, normalizeErrorMessage, getAuthToken } from './api';

export { ApiError, normalizeErrorMessage, getAuthToken };

/**
 * Backward-compatible fetchApi wrapper that routes all requests through
 * the Centralized Axios Client architecture.
 *
 * This guarantees:
 * - Single Axios instance
 * - Unified request/response interceptors
 * - Automated Bearer token injection
 * - Automated X-Correlation-ID / X-Request-ID tracking
 * - Standardized error normalization without database leaks
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let data: any = undefined;
  if (options?.body) {
    if (typeof options.body === 'string') {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    } else {
      data = options.body;
    }
  }

  return api.request<T>({
    url,
    method: method as any,
    data,
    headers: options?.headers as any,
  });
}
