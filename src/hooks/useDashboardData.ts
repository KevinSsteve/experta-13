
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDailySales, 
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
    } else {
      console.log('useDashboardData: Carregando dados para o usuário:', userId);
    }
  }, [userId]);
  
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days, userId],
    queryFn: () => {
      console.log(`Buscando KPIs para ${days} dias e usuário ${userId}`);
      return getSalesKPIs(days, userId);
    },
    enabled: !!userId, // Só execute se houver um userId
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar KPIs:', error);
      }
    }
  });
  
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days, userId],
    queryFn: () => {
      console.log(`Buscando vendas diárias para ${days} dias e usuário ${userId}`);
      return fetchDailySales(days, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar vendas diárias:', error);
      }
    }
  });
  
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: () => {
      console.log(`Buscando vendas recentes para usuário ${userId}`);
      return getRecentSales(5, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar vendas recentes:', error);
      }
    }
  });
  
  const topProductsQuery = useQuery({
    queryKey: ['topProducts', days, userId],
    queryFn: () => {
      console.log(`Buscando produtos mais vendidos para usuário ${userId}`);
      return getTopSellingProducts(5, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar produtos mais vendidos:', error);
      }
    }
  });
  
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts', userId],
    queryFn: () => {
      console.log(`Buscando produtos com estoque baixo para usuário ${userId}`);
      return getLowStockProducts(10, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar produtos com estoque baixo:', error);
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
