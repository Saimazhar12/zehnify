import axios from 'axios';
import { clearStoredSession, isTokenExpired } from './auth';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (isTokenExpired(token)) {
        clearStoredSession();
        window.dispatchEvent(new Event('zehnify:session-expired'));
        return Promise.reject(new Error('Access token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!error.config?.headers?.Authorization;

    if (error.response?.status === 401 && hadToken) {
      clearStoredSession();
      window.dispatchEvent(new Event('zehnify:session-expired'));

      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
