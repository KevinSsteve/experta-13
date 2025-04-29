
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
      if (!userId) {
        console.log('[useDashboardData] Sem usuário autenticado, não é possível buscar KPIs');
        return null;
      }
      console.log(`[useDashboardData] Buscando KPIs para os últimos ${days} dias`);
      return await getSalesKPIs(days, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // Usando hooks modularizados para carregamento de dados
  const recentSales = useRecentSales(userId, isAuthReady);
  const lowStock = useLowStockProducts(userId, isAuthReady);
  
  // Função unificada para forçar a atualização dos dados
  const refreshData = async () => {
    if (!userId) {
      toast.error('Não foi possível atualizar: usuário não identificado');
      return;
    }
    
    setIsRefreshing(true);
    console.log('[useDashboardData] Atualizando todos os dados do dashboard...');
    
    try {
      const results = await Promise.allSettled([
        salesKPIs.refetch(),
        recentSales.refetch(),
        lowStock.refetch()
      ]);
      
      const hasErrors = results.some(result => result.status === 'rejected');
      
      if (hasErrors) {
        toast.warning('Alguns dados não puderam ser atualizados');
        console.warn('[useDashboardData] Alguns dados não puderam ser atualizados');
      } else {
        toast.success('Dados do dashboard atualizados com sucesso');
        console.log('[useDashboardData] Atualização concluída com sucesso');
      }
    } catch (error) {
      console.error('[useDashboardData] Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar os dados');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Combinando todos os estados de carregamento
  const isLoading = (salesKPIs.isLoading || recentSales.isLoading || lowStock.isLoading || isRefreshing) && userId !== undefined;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = !!salesKPIs.error || !!recentSales.error || !!lowStock.error;
  
  // Verificando se não há dados
  const noData = !salesKPIs.data && !recentSales.data && !lowStock.data && !isLoading;

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
