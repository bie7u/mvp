import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  
  login: async (email, password) => {
    try {
      const response = await api.post('/token/', { email, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Get user profile
      const userResponse = await api.get('/accounts/users/profile/');
      
      set({
        user: userResponse.data,
        accessToken: access,
        refreshToken: refresh,
      });
      
      return userResponse.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
  
  updateUser: (userData) => {
    set({ user: userData });
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },
  
  isRootAdmin: () => {
    const state = get();
    return state.user?.role === 'ROOT_ADMIN';
  },
  
  isClientAdmin: () => {
    const state = get();
    return state.user?.role === 'CLIENT_ADMIN';
  },
  
  isEmployee: () => {
    const state = get();
    return state.user?.role === 'EMPLOYEE';
  },
}));

export default useAuthStore;

