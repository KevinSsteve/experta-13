
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSalesSummary = (days: number, userId?: string, isAuthReady = false) => {
  return useQuery({
    queryKey: ['salesSummary', days, userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      console.log(`[useSalesSummary] Buscando resumo de vendas de ${startDate.toISOString()} até ${endDate.toISOString()}`);
      
      const { data, error } = await supabase
        .from('sales')
        .select('id, total, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('user_id', userId);
      
      if (error) {
        console.error('[useSalesSummary] Erro:', error);
        throw error;
      }
      
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
    refetchOnWindowFocus: true, // Atualiza quando a janela recebe foco
  });
};
