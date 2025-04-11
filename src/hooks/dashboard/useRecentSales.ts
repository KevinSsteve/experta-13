
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentSales = (userId?: string, isAuthReady = false) => {
  return useQuery({
    queryKey: ['recentSales', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useRecentSales] Sem userId, não é possível buscar vendas');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useRecentSales] Buscando vendas recentes para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[useRecentSales] Erro ao buscar vendas:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[useRecentSales] Nenhuma venda encontrada para o usuário:', userId);
      } else {
        console.log('[useRecentSales] Vendas encontradas:', data.length);
      }
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};
