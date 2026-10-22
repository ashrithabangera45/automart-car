import axios from 'axios';

// Get base URL from Vite environment variables with fallback
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token from localStorage if user is logged in
api.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (err) {
    console.error('Error attaching auth token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
