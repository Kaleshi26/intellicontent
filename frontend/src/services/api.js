// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';  // Use /api instead of http://localhost:8000

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/token', formData);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Content services
export const contentService = {
  generate: async (prompt, contentType, model = 'gpt-3.5-turbo', maxTokens = 500) => {
    const response = await api.post('/generate', {
      prompt,
      content_type: contentType,
      model,
      max_tokens: maxTokens,
    });
    return response.data;
  },

  getContents: async (skip = 0, limit = 100) => {
    const response = await api.get(`/contents?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getContent: async (id) => {
    const response = await api.get(`/contents/${id}`);
    return response.data;
  },

  deleteContent: async (id) => {
    const response = await api.delete(`/contents/${id}`);
    return response.data;
  },
};