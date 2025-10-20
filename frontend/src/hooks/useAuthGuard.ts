import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const useAuthGuard = (redirectTo: string = '/'): void => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);
};