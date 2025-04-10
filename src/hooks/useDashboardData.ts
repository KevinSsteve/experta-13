
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDailySales, 
  fetchSalesByCategory, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { user } = useAuth();
  const userId = user?.id;
  
  useEffect(() => {
    // Log para depuração
    if (!userId) {
      console.warn('useDashboardData: Não há usuário logado, as consultas serão desativadas');
    }
  }, [userId]);
  
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days, userId],
    queryFn: () => getSalesKPIs(days, userId),
    enabled: !!userId, // Only execute if there's a userId
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching KPIs:', error);
      }
    }
  });
  
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days, userId],
    queryFn: () => fetchDailySales(days, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching daily sales:', error);
      }
    }
  });
  
  const salesByCategoryQuery = useQuery({
    queryKey: ['salesByCategory', days, userId],
    queryFn: () => fetchSalesByCategory(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching sales by category:', error);
      }
    }
  });
  
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: () => getRecentSales(5, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching recent sales:', error);
      }
    }
  });
  
  const topProductsQuery = useQuery({
    queryKey: ['topProducts', days, userId],
    queryFn: () => getTopSellingProducts(5, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching top products:', error);
      }
    }
  });
  
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts', userId],
    queryFn: () => getLowStockProducts(10, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching low stock products:', error);
      }
    }
  });

  return {
    kpis: {
      data: kpisQuery.data,
      isLoading: kpisQuery.isLoading,
      error: kpisQuery.error
    },
    dailySales: {
      data: dailySalesQuery.data,
      isLoading: dailySalesQuery.isLoading,
      error: dailySalesQuery.error
    },
    salesByCategory: {
      data: salesByCategoryQuery.data,
      isLoading: salesByCategoryQuery.isLoading,
      error: salesByCategoryQuery.error
    },
    recentSales: {
      data: recentSalesQuery.data,
      isLoading: recentSalesQuery.isLoading,
      error: recentSalesQuery.error
    },
    topProducts: {
      data: topProductsQuery.data,
      isLoading: topProductsQuery.isLoading,
      error: topProductsQuery.error
    },
    lowStockProducts: {
      data: lowStockProductsQuery.data,
      isLoading: lowStockProductsQuery.isLoading,
      error: lowStockProductsQuery.error
    }
  };
};
