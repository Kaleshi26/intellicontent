// frontend/src/services/api.js
// API service module for interacting with the backend server
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
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
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/refresh-token', { refresh_token: refreshToken });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post('/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/users/me/sessions');
    return response.data;
  },

  revokeSession: async (sessionToken) => {
    const response = await api.delete(`/users/me/sessions/${sessionToken}`);
    return response.data;
  },
};

// Content services
export const contentService = {
  generate: async (request) => {
    const response = await api.post('/generate', request);
    return response.data;
  },

  generateBatch: async (requests) => {
    const response = await api.post('/generate/batch', { requests });
    return response.data;
  },

  optimizePrompt: async (prompt, contentType) => {
    const response = await api.post('/optimize-prompt', { prompt, content_type: contentType });
    return response.data;
  },

  getContents: async (params = {}) => {
    const response = await api.get('/contents', { params });
    return response.data;
  },

  getContent: async (id) => {
    const response = await api.get(`/contents/${id}`);
    return response.data;
  },

  updateContent: async (id, updates) => {
    const response = await api.put(`/contents/${id}`, updates);
    return response.data;
  },

  deleteContent: async (id) => {
    const response = await api.delete(`/contents/${id}`);
    return response.data;
  },

  shareContent: async (id, expiresInHours = 24) => {
    const response = await api.post(`/contents/${id}/share`, { expires_in_hours: expiresInHours });
    return response.data;
  },

  getSharedContent: async (shareToken) => {
    const response = await api.get(`/shared/${shareToken}`);
    return response.data;
  },

  exportContent: async (id, exportType) => {
    const response = await api.post(`/contents/${id}/export?export_type=${exportType}`, {}, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Template services
export const templateService = {
  getTemplates: async (params = {}) => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  createTemplate: async (template) => {
    const response = await api.post('/templates', template);
    return response.data;
  },

  updateTemplate: async (id, updates) => {
    const response = await api.put(`/templates/${id}`, updates);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
};

// Analytics services
export const analyticsService = {
  getUserAnalytics: async () => {
    const response = await api.get('/analytics/user');
    return response.data;
  },

  getSystemAnalytics: async () => {
    const response = await api.get('/analytics/system');
    return response.data;
  },
};

// Admin services
export const adminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Webhook services
export const webhookService = {
  getWebhooks: async () => {
    const response = await api.get('/webhooks');
    return response.data;
  },

  createWebhook: async (webhook) => {
    const response = await api.post('/webhooks', webhook);
    return response.data;
  },

  updateWebhook: async (id, updates) => {
    const response = await api.put(`/webhooks/${id}`, updates);
    return response.data;
  },

  deleteWebhook: async (id) => {
    const response = await api.delete(`/webhooks/${id}`);
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// File upload service
export const fileService = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  delete: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
};

// Search service
export const searchService = {
  search: async (query, filters = {}) => {
    const response = await api.get('/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  getSuggestions: async (query) => {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },
};

// Export all services
export default {
  auth: authService,
  content: contentService,
  template: templateService,
  analytics: analyticsService,
  admin: adminService,
  webhook: webhookService,
  notification: notificationService,
  file: fileService,
  search: searchService,
};