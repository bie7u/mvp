import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    axios.post(`${API_URL}/api/auth/login/`, { username, password }),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  changePassword: (data) => api.post('/users/change_password/', data),
  resetPassword: (email) => api.post('/users/reset_password/', { email }),
  getUsers: (params) => api.get('/users/', { params }),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  resendInvitation: (id) => api.post(`/users/${id}/resend_invitation/`),
};

// Companies API
export const companiesAPI = {
  getCompanies: (params) => api.get('/companies/', { params }),
  getCompany: (id) => api.get(`/companies/${id}/`),
  createCompany: (data) => api.post('/companies/', data),
  updateCompany: (id, data) => api.patch(`/companies/${id}/`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}/`),
  assignLeague: (id, leagueId) => api.post(`/companies/${id}/assign_league/`, { league_id: leagueId }),
  removeLeague: (id, leagueId) => api.delete(`/companies/${id}/remove_league/`, { data: { league_id: leagueId } }),
  getScoringConfig: (id) => api.get(`/companies/${id}/scoring_config/`),
  updateScoringConfig: (id, data) => api.patch(`/companies/${id}/scoring_config/`, data),
};

// Leagues API
export const leaguesAPI = {
  getLeagues: (params) => api.get('/leagues/', { params }),
  getLeague: (id) => api.get(`/leagues/${id}/`),
  createLeague: (data) => api.post('/leagues/', data),
  updateLeague: (id, data) => api.patch(`/leagues/${id}/`, data),
  deleteLeague: (id) => api.delete(`/leagues/${id}/`),
};

// Matches API
export const matchesAPI = {
  getMatches: (params) => api.get('/matches/', { params }),
  getMatch: (id) => api.get(`/matches/${id}/`),
  createMatch: (data) => api.post('/matches/', data),
  updateMatch: (id, data) => api.patch(`/matches/${id}/`, data),
  deleteMatch: (id) => api.delete(`/matches/${id}/`),
};

// Predictions API
export const predictionsAPI = {
  getPredictions: (params) => api.get('/predictions/', { params }),
  getPrediction: (id) => api.get(`/predictions/${id}/`),
  createPrediction: (data) => api.post('/predictions/', data),
  updatePrediction: (id, data) => api.patch(`/predictions/${id}/`, data),
  deletePrediction: (id) => api.delete(`/predictions/${id}/`),
};

// Rankings API
export const rankingsAPI = {
  getRankings: (params) => api.get('/rankings/', { params }),
  updateRankings: (data) => api.post('/rankings/update_rankings/', data),
};

export default api;
