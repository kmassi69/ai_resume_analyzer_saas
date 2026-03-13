import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  hydrateFromStorage: () => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try {
        const user = JSON.parse(saved);
        set({ token, user, loading: false, isAuthenticated: true });
        return;
      } catch {
        // fall through to clear
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, loading: false, isAuthenticated: false });
  },

  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

