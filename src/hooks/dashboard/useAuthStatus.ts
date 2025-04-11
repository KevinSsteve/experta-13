
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthStatus = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    if (user) {
      console.log('[useAuthStatus] Usuário autenticado:', userId);
      setIsAuthReady(true);
    } else {
      console.log('[useAuthStatus] Aguardando autenticação...');
    }
  }, [user, userId]);

  return { userId, isAuthReady };
};
