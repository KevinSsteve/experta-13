
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSalesSummary = (days: number, userId?: string, isAuthReady = false) => {
  const query = useQuery({
    queryKey: ['salesSummary', days, userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useSalesSummary] Sem userId, não é possível buscar resumo de vendas');
        throw new Error('Usuário não autenticado');
      }
      
      console.log(`[useSalesSummary] Buscando resumo de vendas dos últimos ${days} dias para usuário ${userId}`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('sales')
        .select('id, total, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('user_id', userId);
      
      if (error) {
        console.error('[useSalesSummary] Erro ao buscar resumo de vendas:', error);
        throw error;
      }
      
      console.log(`[useSalesSummary] Dados recebidos:`, data ? data.length : 0, 'vendas');
      
      if (!data || data.length === 0) {
        console.log('[useSalesSummary] Nenhuma venda encontrada para o período');
        return {
          totalSales: 0,
          totalRevenue: 0,
          averageTicket: 0
        };
      }
      
      // Calcular totais
      const totalSales = data.length;
      const totalRevenue = data.reduce((sum, sale) => sum + Number(sale.total), 0);
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
      
      console.log(`[useSalesSummary] Calculado: ${totalSales} vendas, R$${totalRevenue.toFixed(2)} em receita`);
      
      return {
        totalSales,
        totalRevenue,
        averageTicket
      };
    },
    enabled: !!userId && isAuthReady,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });

  return query;
};
