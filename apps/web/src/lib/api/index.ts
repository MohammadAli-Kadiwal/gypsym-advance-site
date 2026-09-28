export { api } from './client';
export { axiosInstance, axiosInstance as apiClient } from './axios-client';
export { ApiError, normalizeErrorMessage } from './errors';
export { API_CONFIG } from './config';
export type {
  ApiResponse,
  ApiErrorDetail,
  ApiErrorPayload,
  CustomRequestConfig,
  QueryParams,
} from './types';

// Re-export Server CMS functions and DTO types
export * from './cms';
export * from './seo';
