/**
 * Centralized API Client Configuration
 * Environment-driven with strict runtime validation.
 */

export const getApiBaseUrl = (): string => {
  // 1. In browser runtime, inspect current host
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

    // If accessing from local machine or private LAN
    if (
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      currentHost === '[::1]' ||
      currentHost.startsWith('192.168.') ||
      currentHost.startsWith('10.') ||
      currentHost.startsWith('172.') ||
      currentHost.endsWith('.local')
    ) {
      const apiPort = process.env.NEXT_PUBLIC_API_PORT || '4000';
      return `${protocol}//${currentHost}:${apiPort}/api/v1`;
    }

    // If on production domain
    if (currentHost.includes('gypsym.com')) {
      return 'https://gypsym.com/api/v1';
    }
  }

  // 2. Server-side (SSR / Node.js runtime)
  const envUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('api.gypsym.com')) {
    return envUrl.replace(/\/+$/, '');
  }

  // Safe default for local execution
  return 'http://127.0.0.1:4000/api/v1';
};

export const API_CONFIG = {
  get baseURL() {
    return getApiBaseUrl();
  },
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
