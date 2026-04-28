import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Backend NestJS API URL
});

// Interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ecoloop_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
