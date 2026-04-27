import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, register, logout, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
    }
  }, [isAuthenticated, user, fetchMe]);

  return { user, isAuthenticated, isLoading, login, register, logout };
};
