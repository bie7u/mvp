import api from '../utils/api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}/`);
  },
};

export const clientService = {
  getClients: async () => {
    const response = await api.get('/clients/');
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/clients/', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await api.patch(`/clients/${id}/`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    await api.delete(`/clients/${id}/`);
  },

  getClientUsers: async (id) => {
    const response = await api.get(`/clients/${id}/users/`);
    return response.data;
  },

  getClientStatistics: async (id) => {
    const response = await api.get(`/clients/${id}/statistics/`);
    return response.data;
  },
};

export const matchService = {
  getMatches: async () => {
    const response = await api.get('/matches/');
    return response.data;
  },

  getUpcomingMatches: async () => {
    const response = await api.get('/matches/upcoming/');
    return response.data;
  },

  getRecentMatches: async () => {
    const response = await api.get('/matches/recent/');
    return response.data;
  },

  createMatch: async (matchData) => {
    const response = await api.post('/matches/', matchData);
    return response.data;
  },

  updateMatch: async (id, matchData) => {
    const response = await api.patch(`/matches/${id}/`, matchData);
    return response.data;
  },

  updateMatchResult: async (id, homeScore, awayScore) => {
    const response = await api.post(`/matches/${id}/update_result/`, {
      home_score: homeScore,
      away_score: awayScore,
    });
    return response.data;
  },
};

export const betService = {
  getBets: async () => {
    const response = await api.get('/bets/');
    return response.data;
  },

  getMyBets: async () => {
    const response = await api.get('/bets/my_bets/');
    return response.data;
  },

  createBet: async (betData) => {
    const response = await api.post('/bets/', betData);
    return response.data;
  },
};

export const leaderboardService = {
  getGlobalRanking: async () => {
    const response = await api.get('/leaderboard/global_ranking/');
    return response.data;
  },

  getClientRanking: async () => {
    const response = await api.get('/leaderboard/client_ranking/');
    return response.data;
  },
};

export const statisticsService = {
  getOverview: async () => {
    const response = await api.get('/statistics/overview/');
    return response.data;
  },
};
