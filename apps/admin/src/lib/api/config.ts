/**
 * Centralized API Client Configuration
 * Environment-driven with strict runtime validation.
 */

const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[API Configuration Error] NEXT_PUBLIC_API_URL is missing in production environment!');
    }
    return 'http://localhost:4000/api/v1';
  }
  // Strip trailing slashes for consistency
  return envUrl.replace(/\/+$/, '');
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: {
    default: 15000, // 15 seconds for standard REST calls
    upload: 60000,  // 60 seconds for multipart file uploads
    download: 30000 // 30 seconds for binary downloads
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
} as const;
