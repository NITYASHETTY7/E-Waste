import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Backend NestJS API URL
});

// Interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ecoloop_token');
    const isPublicRoute = 
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/refresh');
    if (token && config.headers && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || '';
    const isAuthRoute = url.includes('/auth/');
    if (error?.response?.status === 401 && !isAuthRoute) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ecoloop_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
