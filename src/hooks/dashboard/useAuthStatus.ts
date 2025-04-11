
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
      setIsAuthReady(false);
    }
  }, [user, userId]);

  console.log('[useAuthStatus] Estado atual:', { userId, isAuthReady });
  return { userId, isAuthReady };
};
