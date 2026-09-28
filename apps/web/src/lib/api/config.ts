/**
 * Centralized API Client Configuration for Public Web Application
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
  return envUrl.replace(/\/+$/, '');
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: {
    default: 15000, // 15 seconds for general public API calls
    upload: 60000,  // 60 seconds for inquiries with attachments
    download: 30000,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
} as const;
