import { useState } from 'react';
import { authService, type LoginCredentials, type User } from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

   const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(credentials);
      authService.storeAuthData(response.access_token, response.user);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    loading,
    error
  };
};