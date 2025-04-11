
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLowStockProducts = (userId?: string, isAuthReady = false) => {
  const query = useQuery({
    queryKey: ['lowStock', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useLowStockProducts] Sem userId, não é possível buscar produtos');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useLowStockProducts] Buscando produtos com estoque baixo para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('[useLowStockProducts] Erro:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[useLowStockProducts] Nenhum produto com estoque baixo encontrado');
      } else {
        console.log(`[useLowStockProducts] Encontrados ${data.length} produtos com estoque baixo`);
      }
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true, // Atualiza quando a janela recebe foco
  });

  return query;
};
