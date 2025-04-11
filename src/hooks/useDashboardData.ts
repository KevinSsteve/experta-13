
import { useAuthStatus } from './dashboard/useAuthStatus';
import { useSalesSummary } from './dashboard/useSalesSummary';
import { useRecentSales } from './dashboard/useRecentSales';
import { useLowStockProducts } from './dashboard/useLowStockProducts';
import { useEffect } from 'react';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { userId, isAuthReady } = useAuthStatus();
  
  // Buscar resumo de vendas
  const salesSummaryQuery = useSalesSummary(days, userId, isAuthReady);
  
  // Buscar vendas recentes
  const recentSalesQuery = useRecentSales(userId, isAuthReady);
  
  // Buscar produtos com baixo estoque
  const lowStockQuery = useLowStockProducts(userId, isAuthReady);
  
  // Atualizar dados quando a autenticação estiver pronta
  useEffect(() => {
    if (isAuthReady && userId) {
      console.log('[useDashboardData] Autenticação pronta, atualizando dados...', { userId });
      // Forçar atualização dos dados quando o componente montar e a autenticação estiver pronta
      salesSummaryQuery.refetch();
      recentSalesQuery.refetch();
      lowStockQuery.refetch();
    } else {
      console.log('[useDashboardData] Aguardando autenticação ou userId...', { isAuthReady, userId });
    }
  }, [isAuthReady, userId, salesSummaryQuery, recentSalesQuery, lowStockQuery]);
  
  // Combinando todos os estados de carregamento
  const isLoading = salesSummaryQuery.isLoading || recentSalesQuery.isLoading || lowStockQuery.isLoading;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = salesSummaryQuery.error || recentSalesQuery.error || lowStockQuery.error;
  
  // Verificando se não há dados
  const noData = !salesSummaryQuery.data && !recentSalesQuery.data && !lowStockQuery.data;

  return {
    salesSummary: salesSummaryQuery,
    recentSales: recentSalesQuery,
    lowStock: lowStockQuery,
    dashboardState: {
      isLoading,
      hasError,
      noData,
      isAuthReady,
      userId
    }
  };
};
