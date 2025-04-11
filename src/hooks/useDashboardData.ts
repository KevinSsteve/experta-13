
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStatus } from './dashboard/useAuthStatus';
import { useSalesSummary } from './dashboard/useSalesSummary';
import { useRecentSales } from './dashboard/useRecentSales';
import { useLowStockProducts } from './dashboard/useLowStockProducts';
import { refreshAllData } from './dashboard/useDashboardUtils';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { userId, isAuthReady } = useAuthStatus();
  
  // Buscar resumo de vendas
  const salesSummaryQuery = useSalesSummary(days, userId, isAuthReady);
  
  // Buscar vendas recentes
  const recentSalesQuery = useRecentSales(userId, isAuthReady);
  
  // Buscar produtos com baixo estoque
  const lowStockQuery = useLowStockProducts(userId, isAuthReady);
  
  // Função para forçar atualização de todos os dados
  const refreshAllDataFn = async () => {
    return await refreshAllData([
      salesSummaryQuery.refetch,
      recentSalesQuery.refetch,
      lowStockQuery.refetch
    ]);
  };
  
  // Combinando todos os estados de carregamento
  const isLoading = salesSummaryQuery.isLoading || recentSalesQuery.isLoading || lowStockQuery.isLoading;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = salesSummaryQuery.error || recentSalesQuery.error || lowStockQuery.error;
  
  // Verificando se não há dados
  const noData = !salesSummaryQuery.data && !recentSalesQuery.data && !lowStockQuery.data;

  return {
    salesSummary: {
      data: salesSummaryQuery.data,
      isLoading: salesSummaryQuery.isLoading,
      error: salesSummaryQuery.error
    },
    recentSales: {
      data: recentSalesQuery.data,
      isLoading: recentSalesQuery.isLoading,
      error: recentSalesQuery.error
    },
    lowStock: {
      data: lowStockQuery.data,
      isLoading: lowStockQuery.isLoading,
      error: lowStockQuery.error
    },
    dashboardState: {
      isLoading,
      hasError,
      noData,
      isAuthReady,
      userId
    },
    refreshAllData: refreshAllDataFn
  };
};
