import { useAuthStore } from '../state/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    hydrateFromStorage,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    hydrateFromStorage,
  };
};

