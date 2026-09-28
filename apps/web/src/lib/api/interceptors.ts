import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError } from './errors';
import { API_CONFIG } from './config';
import type { CustomRequestConfig, ApiErrorDetail } from './types';

function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function setupInterceptors(client: AxiosInstance): void {
  // Request Interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const customConfig = config as CustomRequestConfig & InternalAxiosRequestConfig;

      // Attach correlation ID
      const correlationId = generateCorrelationId();
      config.headers.set('X-Correlation-ID', correlationId);
      config.headers.set('X-Request-ID', correlationId);

      // Dynamic timeout
      if (customConfig.timeoutType === 'upload') {
        config.timeout = API_CONFIG.timeout.upload;
      } else if (customConfig.timeoutType === 'download') {
        config.timeout = API_CONFIG.timeout.download;
      } else if (!config.timeout) {
        config.timeout = API_CONFIG.timeout.default;
      }

      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        (config as any).__startTime = performance.now();
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const startTime = (response.config as any).__startTime;
        const duration = startTime ? Math.round(performance.now() - startTime) : 0;
        const method = response.config.method?.toUpperCase();
        const url = response.config.url;
        const reqId = response.headers['x-correlation-id'] || response.headers['x-request-id'];
        if (duration > 1200) {
          console.warn(`[Web API Slow] ${method} ${url} ${response.status} (${duration}ms) [${reqId || 'no-id'}]`);
        }
      }

      // Auto unwrap standard envelope { success: true, data: T }
      const body = response.data;
      if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
        return body.data;
      }
      return body;
    },
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return Promise.reject(
          new ApiError({
            message: 'The request took too long. Please try again.',
            status: 408,
            code: 'REQUEST_TIMEOUT',
            isTimeout: true,
          })
        );
      }

      if (!error.response) {
        return Promise.reject(
          new ApiError({
            message: 'Unable to connect to the server. Please check your internet connection.',
            status: 0,
            code: 'NETWORK_ERROR',
            isNetworkError: true,
          })
        );
      }

      const status = error.response.status;
      const responseData: any = error.response.data;
      const headers = error.response.headers;
      const correlationId =
        (headers['x-correlation-id'] as string) ||
        (headers['x-request-id'] as string) ||
        responseData?.correlationId ||
        responseData?.requestId;

      let code = responseData?.error?.code || responseData?.code || `HTTP_${status}`;
      let serverMessage = responseData?.error?.message || responseData?.message || responseData?.error;

      let validationDetails: ApiErrorDetail[] | undefined;
      if (Array.isArray(responseData?.message)) {
        validationDetails = responseData.message.map((msg: string) => ({ message: msg }));
        serverMessage = responseData.message[0];
      } else if (Array.isArray(responseData?.error?.details)) {
        validationDetails = responseData.error.details;
      }

      const isSafeMessage =
        typeof serverMessage === 'string' &&
        serverMessage.length < 250 &&
        !serverMessage.includes('Prisma') &&
        !serverMessage.includes('Postgres') &&
        !serverMessage.includes('SELECT') &&
        !serverMessage.includes('INSERT') &&
        !serverMessage.includes('table') &&
        !serverMessage.includes('foreign key');

      let friendlyMessage = '';

      switch (status) {
        case 400:
          friendlyMessage = isSafeMessage ? serverMessage : 'Please verify your information.';
          code = code || 'BAD_REQUEST';
          break;

        case 404:
          friendlyMessage = isSafeMessage ? serverMessage : 'The requested item was not found.';
          code = 'NOT_FOUND';
          break;

        case 409:
          friendlyMessage = isSafeMessage ? serverMessage : 'A record with these details already exists.';
          code = 'CONFLICT';
          break;

        case 422:
          friendlyMessage = isSafeMessage ? serverMessage : 'Please check the entered information.';
          code = 'VALIDATION_FAILED';
          break;

        case 429: {
          const retryAfterSec = headers['retry-after'] ? parseInt(headers['retry-after'] as string, 10) : undefined;
          friendlyMessage = retryAfterSec
            ? `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`
            : 'Too many requests. Please wait a moment before trying again.';
          code = 'RATE_LIMIT_EXCEEDED';
          return Promise.reject(
            new ApiError({
              message: friendlyMessage,
              status,
              code,
              requestId: correlationId,
              retryAfter: retryAfterSec,
            })
          );
        }

        case 500:
        case 502:
        case 503:
        case 504:
          friendlyMessage = 'A temporary server error occurred. Please try again shortly.';
          code = 'SERVER_ERROR';
          break;

        default:
          friendlyMessage = isSafeMessage ? serverMessage : 'Unable to complete the request.';
      }

      return Promise.reject(
        new ApiError({
          message: friendlyMessage,
          status,
          code,
          details: validationDetails || responseData?.details,
          requestId: correlationId,
        })
      );
    }
  );
}
