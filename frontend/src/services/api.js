/**
 * Axios API client for AI Resume Analyzer backend
 * Uses /api base path - Vite proxy forwards to backend on port 5000
 */
import axios from 'axios';
import { useAuthStore } from '../state/authStore';

const api = axios.create({
  baseURL: "http://ai-resume-analyzer-saas.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 - clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout?.();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Resume
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getResumeHistory = () => api.get('/resume/history');
export const getResumeById = (id) => api.get(`/resume/${id}`);
