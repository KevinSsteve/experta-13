
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDailySales, 
  fetchSalesByCategory, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products-data';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { user } = useAuth();
  const userId = user?.id;
  
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days, userId],
    queryFn: () => getSalesKPIs(days, userId),
    enabled: !!userId, // Só executa se houver um userId
    retry: false
  });
  
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days, userId],
    queryFn: () => fetchDailySales(days, userId),
    enabled: !!userId,
    retry: false
  });
  
  const salesByCategoryQuery = useQuery({
    queryKey: ['salesByCategory', userId],
    queryFn: () => fetchSalesByCategory(userId),
    enabled: !!userId,
    retry: false
  });
  
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: () => getRecentSales(5, userId),
    enabled: !!userId,
    retry: false
  });
  
  const topProductsQuery = useQuery({
    queryKey: ['topProducts', userId],
    queryFn: () => getTopSellingProducts(5, userId),
    enabled: !!userId,
    retry: false
  });
  
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts', userId],
    queryFn: () => getLowStockProducts(10, userId),
    enabled: !!userId,
    retry: false
  });

  return {
    kpis: {
      data: kpisQuery.data,
      isLoading: kpisQuery.isLoading
    },
    dailySales: {
      data: dailySalesQuery.data,
      isLoading: dailySalesQuery.isLoading
    },
    salesByCategory: {
      data: salesByCategoryQuery.data,
      isLoading: salesByCategoryQuery.isLoading
    },
    recentSales: {
      data: recentSalesQuery.data,
      isLoading: recentSalesQuery.isLoading
    },
    topProducts: {
      data: topProductsQuery.data,
      isLoading: topProductsQuery.isLoading
    },
    lowStockProducts: {
      data: lowStockProductsQuery.data,
      isLoading: lowStockProductsQuery.isLoading
    }
  };
};
