
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';

const PRODUCTS_PER_PAGE = 12;

export function useInfiniteProducts(userId: string | undefined, searchQuery: string = '') {
  return useInfiniteQuery({
    queryKey: ['infiniteProducts', userId, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { products: [], nextCursor: null };

      const from = pageParam * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);

      // Se houver uma busca, aplicar o filtro
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query
        .order('name')
        .range(from, to);

      if (error) throw error;

      const hasMore = data.length === PRODUCTS_PER_PAGE;
      const nextCursor = hasMore ? pageParam + 1 : null;

      return {
        products: data as Product[],
        nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}
