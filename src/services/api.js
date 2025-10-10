import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const analyticsService = {
  getData: () => api.get('/analytics'),
};

export const userService = {
  getUsers: () => api.get('/users'),
};

export const clientService = {
  getClients: () => api.get('/clients'),
  createClient: (data) => api.post('/clients', data),
};

export default api;
