import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // For Sanctum cookie-based auth
});

// Inject Bearer token on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('cyna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear local auth and redirect to login
      localStorage.removeItem('cyna_token');
      localStorage.removeItem('cyna-auth-storage');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
