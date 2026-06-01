import axios from 'axios';

// Use relative URL (same origin as backend)
const api = axios.create({
  baseURL: '/api',  // This will work because frontend is served from backend
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;