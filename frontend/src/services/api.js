import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('crossview_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for error logging
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const apiService = {
  // Auth
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),

  // Dashboard
  getDashboardOverview: () => api.get('/dashboard/overview'),
  getTrendingEvents: () => api.get('/dashboard/trending'),
  getActivityTimeline: (range = '7d') => api.get(`/dashboard/activity?range=${range}`),

  // News
  getNews: (params = {}) => api.get('/news', { params }),
  searchNews: (q, category) => api.get('/news/search', { params: { q, category } }),
  getArticleById: (id) => api.get(`/news/${id}`),
  refreshNews: (data = {}) => api.post('/news/refresh', data),
  uploadNews: (data) => api.post('/news/upload', data),

  // Events
  getEvents: (params = {}) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventArticles: (id) => api.get(`/events/${id}/articles`),
  getEventTimeline: (id) => api.get(`/events/${id}/timeline`),
  getEventComparison: (id) => api.get(`/events/${id}/comparison`),
  getEventReport: (id) => api.get(`/events/${id}/report`),

  // AI Intelligence
  consolidateEvent: (eventId) => api.post(`/ai/consolidate/${eventId}`),
  compareEvent: (eventId) => api.post(`/ai/compare/${eventId}`),
  analyzeClaimsEvent: (eventId) => api.post(`/ai/analyze-claims/${eventId}`),
  askCrossView: (eventId, question, context = {}) =>
    api.post(`/ai/ask/${eventId}`, { question, ...context }),

  // Claims
  getAllClaims: (params = {}) => api.get('/claims', { params }),
  getClaimById: (id) => api.get(`/claims/${id}`),
  getEventClaims: (eventId) => api.get(`/claims/event/${eventId}`),

  // Bookmarks
  getBookmarks: () => api.get('/bookmarks'),
  createBookmark: (data) => api.post('/bookmarks', data),
  deleteBookmark: (id) => api.delete(`/bookmarks/${id}`),

  // Saved Reports
  getSavedReports: () => api.get('/saved-reports'),
  createSavedReport: (data) => api.post('/saved-reports', data),
  deleteSavedReport: (id) => api.delete(`/saved-reports/${id}`),

  // User Profile
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
};

export default api;

