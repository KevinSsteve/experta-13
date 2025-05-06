
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTopSellingProducts } from '@/lib/products-data';

export const useTopProducts = (userId?: string, isAuthReady = false) => {
  const query = useQuery({
    queryKey: ['topProducts', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useTopProducts] Sem userId, não é possível buscar produtos');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useTopProducts] Buscando produtos mais vendidos para usuário ${userId}`);
      
      const data = await getTopSellingProducts(userId, 10);
      
      if (!data || data.length === 0) {
        console.log('[useTopProducts] Nenhum produto encontrado');
      } else {
        console.log(`[useTopProducts] Encontrados ${data.length} produtos`);
      }
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });

  return query;
};
