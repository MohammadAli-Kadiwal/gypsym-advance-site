import type { AxiosRequestConfig } from 'axios';

/**
 * Standard Backend Response Envelope
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  timestamp?: string;
  requestId?: string;
  correlationId?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: ApiErrorDetail[] | Record<string, any>;
  statusCode?: number;
}

export interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorToast?: boolean;
  timeoutType?: 'default' | 'upload' | 'download';
  retryCount?: number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null | (string | number)[];
}
