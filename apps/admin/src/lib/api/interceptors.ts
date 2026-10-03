import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError } from './errors';
import { API_CONFIG } from './config';
import type { CustomRequestConfig, ApiErrorDetail } from './types';

/**
 * Retrieve Enterprise Auth Token from cookie or local storage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )gypsym_admin_token=([^;]+)'));
  if (match && match[2]) return match[2];
  return localStorage.getItem('gypsym_admin_token');
}

/**
 * Generate cryptographically safe correlation ID for distributed tracing
 */
function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Setup request and response interceptors on the Axios client
 */
export function setupInterceptors(client: AxiosInstance): void {
  // ─────────────────────────────────────────────────────────────
  // REQUEST INTERCEPTOR
  // ─────────────────────────────────────────────────────────────
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const customConfig = config as CustomRequestConfig & InternalAxiosRequestConfig;

      // 0. Dynamically resolve baseURL for IP/LAN device access
      if (typeof window !== 'undefined' && window.location?.hostname) {
        const currentHost = window.location.hostname;
        if (currentHost && currentHost !== 'localhost' && config.baseURL) {
          try {
            const parsed = new URL(config.baseURL);
            if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
              parsed.hostname = currentHost;
              config.baseURL = parsed.toString().replace(/\/+$/, '');
            }
          } catch {
            config.baseURL = config.baseURL.replace('localhost', currentHost).replace('127.0.0.1', currentHost);
          }
        }
      }

      // 1. Attach Request & Correlation IDs
      const correlationId = generateCorrelationId();
      config.headers.set('X-Correlation-ID', correlationId);
      config.headers.set('X-Request-ID', correlationId);

      // 2. Set dynamic timeout based on payload type
      if (customConfig.timeoutType === 'upload') {
        config.timeout = API_CONFIG.timeout.upload;
      } else if (customConfig.timeoutType === 'download') {
        config.timeout = API_CONFIG.timeout.download;
      } else if (!config.timeout) {
        config.timeout = API_CONFIG.timeout.default;
      }

      // 3. Centralized Authorization Header Attachment
      if (!customConfig.skipAuth) {
        const token = getAuthToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      }

      // 4. Safe Development Tracing (Never log passwords, tokens, or auth headers)
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        (config as any).__startTime = performance.now();
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ─────────────────────────────────────────────────────────────
  // RESPONSE INTERCEPTOR
  // ─────────────────────────────────────────────────────────────
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Safe development performance log
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const startTime = (response.config as any).__startTime;
        const duration = startTime ? Math.round(performance.now() - startTime) : 0;
        const method = response.config.method?.toUpperCase();
        const url = response.config.url;
        const reqId = response.headers['x-correlation-id'] || response.headers['x-request-id'];
        if (duration > 1000) {
          console.warn(`[API SLOW] ${method} ${url} ${response.status} (${duration}ms) [${reqId || 'no-id'}]`);
        }
      }

      // Auto-unwrap backend envelope { success: true, data: T } if present
      const body = response.data;
      if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
        return body.data;
      }
      return body;
    },
    (error: AxiosError) => {
      // Handle Network Failures & Timeouts
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return Promise.reject(
          new ApiError({
            message: 'The request took too long to complete. Please try again.',
            status: 408,
            code: 'REQUEST_TIMEOUT',
            isTimeout: true,
          })
        );
      }

      if (!error.response) {
        return Promise.reject(
          new ApiError({
            message: 'Unable to connect to the backend server. Please verify your connection.',
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

      // Extract validation details if provided by NestJS ValidationPipe
      let validationDetails: ApiErrorDetail[] | undefined;
      if (Array.isArray(responseData?.message)) {
        // Class-validator format: ['email must be an email', 'password is too short']
        validationDetails = responseData.message.map((msg: string) => ({ message: msg }));
        serverMessage = responseData.message.filter(Boolean).join('. ');
      } else if (Array.isArray(responseData?.error?.details)) {
        validationDetails = responseData.error.details;
      }

      // Sanitize server message to ensure no database columns, SQL, or internal details leak
      const isSafeMessage =
        typeof serverMessage === 'string' &&
        serverMessage.trim().length > 0 &&
        serverMessage.length < 350 &&
        !serverMessage.includes('PrismaClient') &&
        !serverMessage.includes('prisma.') &&
        !serverMessage.includes('PostgresError') &&
        !serverMessage.includes('syntax error at or near') &&
        !serverMessage.includes('foreign key constraint') &&
        !serverMessage.includes('relation "') &&
        !serverMessage.includes('column "');

      let friendlyMessage = '';

      switch (status) {
        case 400:
          friendlyMessage = isSafeMessage ? serverMessage : 'Invalid request. Please verify the submitted data.';
          code = code || 'BAD_REQUEST';
          break;

        case 401:
          friendlyMessage = 'Your session has expired or is invalid. Please sign in again.';
          code = 'UNAUTHORIZED';
          // Notify application of auth expiration without redirect loop
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gypsym:auth:expired', { detail: { status } }));
          }
          break;

        case 403:
          friendlyMessage = isSafeMessage ? serverMessage : 'You do not have permission to perform this action.';
          code = 'FORBIDDEN';
          break;

        case 404:
          friendlyMessage = isSafeMessage ? serverMessage : 'The requested resource was not found.';
          code = 'NOT_FOUND';
          break;

        case 409:
          friendlyMessage = isSafeMessage ? serverMessage : 'A conflict occurred. This record or unique field already exists.';
          code = 'CONFLICT';
          break;

        case 422:
          friendlyMessage = isSafeMessage ? serverMessage : 'Validation failed. Please verify the form inputs.';
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
          friendlyMessage = isSafeMessage ? serverMessage : 'A server error occurred. Please try again later.';
          code = 'SERVER_ERROR';
          break;

        default:
          friendlyMessage = isSafeMessage ? serverMessage : `Unable to complete the operation (${status}).`;
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
