
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  
  // Buscar resumo de vendas
  const salesSummaryQuery = useQuery({
    queryKey: ['salesSummary', days, userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      console.log(`[useDashboardData] Buscando resumo de vendas de ${startDate.toISOString()} até ${endDate.toISOString()}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('id, total, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Calcular totais
      const totalSales = data.length;
      const totalRevenue = data.reduce((sum, sale) => sum + Number(sale.total), 0);
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
      
      return {
        totalSales,
        totalRevenue,
        averageTicket
      };
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
  
  // Buscar vendas recentes
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      console.log(`[useDashboardData] Buscando vendas recentes para usuário ${userId}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  
  // Buscar produtos com baixo estoque
  const lowStockQuery = useQuery({
    queryKey: ['lowStock', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      console.log(`[useDashboardData] Buscando produtos com estoque baixo`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  
  // Função para forçar atualização de todos os dados
  const refreshAllData = async () => {
    try {
      console.log('[useDashboardData] Forçando atualização de todos os dados...');
      await Promise.all([
        salesSummaryQuery.refetch(),
        recentSalesQuery.refetch(),
        lowStockQuery.refetch()
      ]);
      console.log('[useDashboardData] Todos os dados foram atualizados');
      toast.success('Dados atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('[useDashboardData] Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar os dados');
      return false;
    }
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
    refreshAllData
  };
};
