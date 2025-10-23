import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies with requests
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh for login, logout, verify, or refresh endpoints
    const skipRefreshEndpoints = ['/login', '/logout', '/verify', '/refresh'];
    const shouldSkipRefresh = skipRefreshEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // If error is 401 and we haven't tried to refresh yet and not on skip endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post('/refresh');
        processQueue(null);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // If refresh fails, redirect to login (but only if not already on login page)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  verify: () => api.get('/verify'),
  refresh: () => api.post('/refresh'),
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

export const predictionsService = {
  getUpcomingMatches: () => api.get('/predictions/matches'),
  getUserPredictions: () => api.get('/predictions/user'),
  createPrediction: (data) => api.post('/predictions', data),
  updatePrediction: (predictionId, data) => api.put(`/predictions/${predictionId}`, data),
};

export const rankingService = {
  getRanking: (clientId) => api.get('/rankings', { params: { clientId } }),
};

export default api;
