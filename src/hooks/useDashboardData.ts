
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getSalesKPIs } from '@/lib/sales';

export const useDashboardData = (timeRange: string) => {
  const { user } = useAuth();
  const userId = user?.id;
  const days = parseInt(timeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query para buscar resumo de vendas
  const salesKPIsQuery = useQuery({
    queryKey: ['salesKPIs', days, userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getSalesKPIs(parseInt(timeRange), userId);
    },
    enabled: !!userId
  });

  // Query para buscar vendas recentes
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useDashboardData] Sem userId, não é possível buscar vendas recentes');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useDashboardData] Buscando vendas recentes para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[useDashboardData] Erro ao buscar vendas recentes:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[useDashboardData] Nenhuma venda recente encontrada');
      } else {
        console.log('[useDashboardData] Vendas recentes encontradas:', data.length);
      }
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  
  // Query para buscar produtos com baixo estoque
  const lowStockQuery = useQuery({
    queryKey: ['lowStock', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useDashboardData] Sem userId, não é possível buscar produtos com baixo estoque');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useDashboardData] Buscando produtos com estoque baixo para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('[useDashboardData] Erro ao buscar produtos com baixo estoque:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[useDashboardData] Nenhum produto com estoque baixo encontrado');
      } else {
        console.log(`[useDashboardData] Encontrados ${data.length} produtos com estoque baixo`);
      }
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  
  useEffect(() => {
    if (userId) {
      console.log('[useDashboardData] UserId disponível, refazendo consultas...', { userId });
      // Forçar atualização dos dados quando o componente montar e o ID do usuário estiver disponível
      salesKPIsQuery.refetch();
      recentSalesQuery.refetch();
      lowStockQuery.refetch();
    } else {
      console.log('[useDashboardData] Aguardando userId...', { userId });
    }
  }, [userId, timeRange]);
  
  // Função para forçar a atualização dos dados
  const refreshData = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    console.log('[useDashboardData] Atualizando dados...');
    
    try {
      await Promise.all([
        salesKPIsQuery.refetch(),
        recentSalesQuery.refetch(),
        lowStockQuery.refetch()
      ]);
      
      console.log('[useDashboardData] Dados atualizados com sucesso');
    } catch (error) {
      console.error('[useDashboardData] Erro ao atualizar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Combinando todos os estados de carregamento
  const isLoading = salesKPIsQuery.isLoading || recentSalesQuery.isLoading || lowStockQuery.isLoading || isRefreshing;
  
  // Verificando se houve erro em alguma das consultas
  const hasError = !!salesKPIsQuery.error || !!recentSalesQuery.error || !!lowStockQuery.error;
  
  // Verificando se não há dados
  const noData = !salesKPIsQuery.data && !recentSalesQuery.data && !lowStockQuery.data;
  
  // Status da autenticação
  const isAuthReady = !!userId;

  return {
    salesKPIs: salesKPIsQuery,
    recentSales: recentSalesQuery,
    lowStock: lowStockQuery,
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
