import axios from 'axios';
import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = (): string => {
  // 1. User manual override saved in localStorage
  const savedUrl = localStorage.getItem('api_server_url');
  if (savedUrl && savedUrl.trim()) {
    let clean = savedUrl.trim();
    if (!clean.endsWith('/api/v1')) {
      clean = clean.replace(/\/+$/, '') + '/api/v1';
    }
    return clean;
  }

  // 2. Build-time environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 3. Native Android / iOS app detection
  if (Capacitor.isNativePlatform() || window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && !window.location.port)) {
    return 'https://exp.shadiqur.bd/api/v1';
  }

  // 4. Default for Web browser (relative path matches current origin or Vite proxy)
  return '/api/v1';
};

export const setApiBaseUrl = (newUrl: string | null) => {
  if (newUrl && newUrl.trim()) {
    let clean = newUrl.trim();
    if (!clean.endsWith('/api/v1')) {
      clean = clean.replace(/\/+$/, '') + '/api/v1';
    }
    localStorage.setItem('api_server_url', clean);
    apiClient.defaults.baseURL = clean;
  } else {
    localStorage.removeItem('api_server_url');
    apiClient.defaults.baseURL = getApiBaseUrl();
  }
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${getApiBaseUrl()}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
