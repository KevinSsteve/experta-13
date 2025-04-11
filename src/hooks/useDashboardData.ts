
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchDailySales, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  const { user } = useAuth();
  const userId = user?.id;
  const [isAuthReady, setIsAuthReady] = useState(false);
  const queryClient = useQueryClient();
  
  // Verificar autenticação e preparar o hook
  useEffect(() => {
    if (user) {
      console.log('[useDashboardData] Usuário autenticado:', userId);
      setIsAuthReady(true);
      
      // Verificar se há conexão com o Supabase
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          console.log('[useDashboardData] Sessão do Supabase válida');
        } else {
          console.warn('[useDashboardData] Sem sessão ativa no Supabase');
          toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
        }
      });
    } else {
      console.log('[useDashboardData] Aguardando autenticação...');
    }
  }, [user, userId]);
  
  // KPIs de vendas - configuração atualizada
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days, userId],
    queryFn: async () => {
      console.log(`[useDashboardData] Buscando KPIs para ${days} dias e usuário ${userId}`);
      try {
        const data = await getSalesKPIs(days, userId);
        console.log('[useDashboardData] KPIs carregados:', data);
        return data;
      } catch (error) {
        console.error('[useDashboardData] Erro ao buscar KPIs:', error);
        throw error;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 3,
  });
  
  // Vendas diárias
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days, userId],
    queryFn: async () => {
      console.log(`[useDashboardData] Buscando vendas diárias para ${days} dias e usuário ${userId}`);
      try {
        const data = await fetchDailySales(days, userId);
        console.log('[useDashboardData] Vendas diárias carregadas:', data);
        return data;
      } catch (error) {
        console.error('[useDashboardData] Erro ao buscar vendas diárias:', error);
        throw error;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 3,
  });
  
  // Vendas recentes
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales', userId],
    queryFn: async () => {
      console.log(`[useDashboardData] Buscando vendas recentes para usuário ${userId}`);
      try {
        const data = await getRecentSales(5, userId);
        console.log('[useDashboardData] Vendas recentes carregadas:', data.length);
        return data;
      } catch (error) {
        console.error('[useDashboardData] Erro ao buscar vendas recentes:', error);
        throw error;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 3,
  });
  
  // Produtos mais vendidos
  const topProductsQuery = useQuery({
    queryKey: ['topProducts', days, userId],
    queryFn: async () => {
      console.log(`[useDashboardData] Buscando produtos mais vendidos para usuário ${userId}`);
      try {
        const data = await getTopSellingProducts(5, userId);
        console.log('[useDashboardData] Produtos mais vendidos carregados:', data.length);
        return data;
      } catch (error) {
        console.error('[useDashboardData] Erro ao buscar produtos mais vendidos:', error);
        throw error;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 3,
  });
  
  // Produtos com estoque baixo
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts', userId],
    queryFn: async () => {
      console.log(`[useDashboardData] Buscando produtos com estoque baixo para usuário ${userId}`);
      try {
        const data = await getLowStockProducts(10, userId);
        console.log('[useDashboardData] Produtos com estoque baixo carregados:', data.length);
        return data;
      } catch (error) {
        console.error('[useDashboardData] Erro ao buscar produtos com estoque baixo:', error);
        throw error;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 3,
  });
  
  // Função para forçar atualização de todos os dados
  const refreshAllData = async () => {
    if (queryClient && userId) {
      try {
        console.log('[useDashboardData] Forçando atualização de todos os dados...');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['salesKpis'] }),
          queryClient.invalidateQueries({ queryKey: ['dailySales'] }),
          queryClient.invalidateQueries({ queryKey: ['recentSales'] }),
          queryClient.invalidateQueries({ queryKey: ['topProducts'] }),
          queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] })
        ]);
        console.log('[useDashboardData] Todos os dados foram atualizados');
        toast.success('Dados atualizados com sucesso');
        return true;
      } catch (error) {
        console.error('[useDashboardData] Erro ao atualizar dados:', error);
        toast.error('Erro ao atualizar os dados');
        return false;
      }
    }
    return false;
  };
  
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
    },
    refreshAllData // Nova função para forçar atualização de todos os dados
  };
};
