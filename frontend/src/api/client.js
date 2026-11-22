import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : (rawApiUrl.endsWith('/') ? `${rawApiUrl}api` : `${rawApiUrl}/api`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rih_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not clear token if merely probing
      const url = error.config.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/demo-accounts')) {
        console.warn('Session expired or unauthorized request. Clearing session.');
        localStorage.removeItem('rih_auth_token');
        localStorage.removeItem('rih_auth_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
