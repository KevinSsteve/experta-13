
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSalesKPIs } from '@/lib/sales';
import { useRecentSales } from './dashboard/useRecentSales';
import { useLowStockProducts } from './dashboard/useLowStockProducts';
import { toast } from 'sonner';

export const useDashboardData = (timeRange: string) => {
  const { user } = useAuth();
  const userId = user?.id;
  const days = parseInt(timeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isAuthReady = !!userId;
  
  // Query para buscar resumo de vendas com KPIs
  const salesKPIs = useQuery({
    queryKey: ['salesKPIs', days, userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log(`[useDashboardData] Buscando KPIs para os últimos ${days} dias`);
      return await getSalesKPIs(parseInt(timeRange), userId);
    },
    enabled: !!userId
  });

  // Usando hooks modularizados para carregamento de dados
  const recentSales = useRecentSales(userId, isAuthReady);
  const lowStock = useLowStockProducts(userId, isAuthReady);
  
  // Função unificada para forçar a atualização dos dados
  const refreshData = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    console.log('[useDashboardData] Atualizando todos os dados do dashboard...');
    
    try {
      await Promise.all([
        salesKPIs.refetch(),
        recentSales.refetch(),
        lowStock.refetch()
      ]);
      
      toast.success('Dados do dashboard atualizados com sucesso');
      console.log('[useDashboardData] Atualização concluída com sucesso');
    } catch (error) {
      console.error('[useDashboardData] Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar os dados');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Combinando todos os estados de carregamento
  const isLoading = salesKPIs.isLoading || recentSales.isLoading || lowStock.isLoading || isRefreshing;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = !!salesKPIs.error || !!recentSales.error || !!lowStock.error;
  
  // Verificando se não há dados
  const noData = !salesKPIs.data && !recentSales.data && !lowStock.data;

  return {
    salesKPIs,
    recentSales,
    lowStock,
    refreshData,
    isRefreshing,
    dashboardState: {
      isLoading,
      hasError,
      noData,
      isAuthReady,
      userId
    }
  };
};
