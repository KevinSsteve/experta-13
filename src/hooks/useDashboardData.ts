
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDailySales, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { user } = useAuth();
  const userId = user?.id;
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Verificar autenticação e preparar o hook
  useEffect(() => {
    if (user) {
      console.log('[useDashboardData] Usuário autenticado:', userId);
      setIsAuthReady(true);
    } else {
      console.log('[useDashboardData] Aguardando autenticação...');
    }
  }, [user, userId]);
  
  // KPIs de vendas
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days, userId],
    queryFn: () => {
      console.log(`[useDashboardData] Buscando KPIs para ${days} dias e usuário ${userId}`);
      return getSalesKPIs(days, userId);
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Vendas diárias
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days, userId],
    queryFn: () => {
      console.log(`[useDashboardData] Buscando vendas diárias para ${days} dias e usuário ${userId}`);
      return fetchDailySales(days, userId);
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Vendas recentes
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: () => {
      console.log(`[useDashboardData] Buscando vendas recentes para usuário ${userId}`);
      return getRecentSales(5, userId);
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Produtos mais vendidos
  const topProductsQuery = useQuery({
    queryKey: ['topProducts', days, userId],
    queryFn: () => {
      console.log(`[useDashboardData] Buscando produtos mais vendidos para usuário ${userId}`);
      return getTopSellingProducts(5, userId);
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Produtos com estoque baixo
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts', userId],
    queryFn: () => {
      console.log(`[useDashboardData] Buscando produtos com estoque baixo para usuário ${userId}`);
      return getLowStockProducts(10, userId);
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  // Combinando todos os estados de carregamento para facilitar a exibição
  const isLoading = kpisQuery.isLoading || dailySalesQuery.isLoading || 
                   recentSalesQuery.isLoading || topProductsQuery.isLoading || 
                   lowStockProductsQuery.isLoading;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = kpisQuery.error || dailySalesQuery.error || 
                  recentSalesQuery.error || topProductsQuery.error || 
                  lowStockProductsQuery.error;
                  
  const noData = !kpisQuery.data && !dailySalesQuery.data && 
                !recentSalesQuery.data && !topProductsQuery.data && 
                !lowStockProductsQuery.data;

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
    },
    dashboardState: {
      isLoading,
      hasError,
      noData,
      isAuthReady,
      userId
    }
  };
};
