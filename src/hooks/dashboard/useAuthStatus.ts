
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthStatus = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState<string | undefined>(user?.id);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    const checkSession = async () => {
      // Verificar sessão diretamente com o Supabase
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      
      if (sessionUser) {
        console.log('[useAuthStatus] Sessão encontrada:', sessionUser.id);
        setUserId(sessionUser.id);
        setIsAuthReady(true);
      } else if (user) {
        // Fallback para o contexto de autenticação
        console.log('[useAuthStatus] Usando usuário do contexto:', user.id);
        setUserId(user.id);
        setIsAuthReady(true);
      } else {
        console.log('[useAuthStatus] Nenhuma sessão ou usuário encontrado');
        setUserId(undefined);
        setIsAuthReady(false);
      }
    };
    
    checkSession();
    
    // Escutar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuthStatus] Evento de autenticação:', event);
      const currentUser = session?.user;
      
      if (currentUser) {
        console.log('[useAuthStatus] Usuário autenticado:', currentUser.id);
        setUserId(currentUser.id);
        setIsAuthReady(true);
      } else {
        console.log('[useAuthStatus] Usuário desconectado');
        setUserId(undefined);
        setIsAuthReady(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user]);

  console.log('[useAuthStatus] Estado atual:', { userId, isAuthReady });
  return { userId, isAuthReady };
};
