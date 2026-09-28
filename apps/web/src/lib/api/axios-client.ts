import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from './config';
import { setupInterceptors } from './interceptors';

function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout.default,
    headers: API_CONFIG.headers,
    withCredentials: API_CONFIG.withCredentials,
  });

  setupInterceptors(instance);

  return instance;
}

export const axiosInstance = createAxiosInstance();
