/**
 * Centralized API Client Configuration for Public Web Application
 * Environment-driven with strict runtime validation.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const defaultUrl = process.env.NODE_ENV === 'production'
    ? 'https://api.gypsym.com/api/v1'
    : 'http://localhost:4000/api/v1';
  let baseUrl = envUrl || defaultUrl;

  // In the browser, if accessing via an IP address (e.g. 192.168.x.x, 10.x.x.x, 127.0.0.1)
  // or a custom host, ensure the API baseURL uses the current hostname instead of 'localhost'.
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname;
    if (currentHost && currentHost !== 'localhost') {
      try {
        const parsed = new URL(baseUrl);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          parsed.hostname = currentHost;
          baseUrl = parsed.toString();
        }
      } catch {
        baseUrl = baseUrl.replace('localhost', currentHost).replace('127.0.0.1', currentHost);
      }
    }
  }

  return baseUrl.replace(/\/+$/, '');
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
