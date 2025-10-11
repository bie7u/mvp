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
  updateUserClient: (userId, clientId) => api.patch(`/users/${userId}/client`, { clientId }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export const clientService = {
  getClients: () => api.get('/clients'),
  createClient: (data) => api.post('/clients', data),
  getClientById: (clientId) => api.get(`/clients/${clientId}`),
  getClientUsers: (clientId) => api.get(`/clients/${clientId}/users`),
};

export default api;
