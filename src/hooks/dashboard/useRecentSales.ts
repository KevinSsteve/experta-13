
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentSales = (userId?: string, isAuthReady = false) => {
  return useQuery({
    queryKey: ['recentSales', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      console.log(`[useRecentSales] Buscando vendas recentes para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
