import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'https://minierp-backend-4m4o.onrender.com/api';
if (baseURL && !baseURL.endsWith('/api')) {
  // Ensure there's no trailing slash before appending
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
