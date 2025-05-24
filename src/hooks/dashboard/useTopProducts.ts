
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/products/types';
import { getTopSellingProducts } from '@/lib/products-data';

export const useTopProducts = (userId?: string, isAuthReady?: boolean, limit = 5) => {
  return useQuery({
    queryKey: ['top-products', userId, limit],
    queryFn: () => getTopSellingProducts(userId, limit),
    enabled: isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
