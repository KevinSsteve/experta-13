import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyProfitData {
  totalSales: number;
  estimatedProfit: number;
  profitRate: number;
  transactionCount: number;
  isLoading: boolean;
}

export const useDailyProfit = (): DailyProfitData => {
  const { user } = useAuth();
  const [data, setData] = useState<DailyProfitData>({
    totalSales: 0,
    estimatedProfit: 0,
    profitRate: 5,
    transactionCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchDailyData = async () => {
      try {
        // Buscar taxa de lucro do perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('profit_rate')
          .eq('id', user.id)
          .single();

        const profitRate = profile?.profit_rate || 5;

        // Buscar vendas de hoje das tabelas experta_go_sales
        const today = new Date().toISOString().split('T')[0];
        
        const { data: sales } = await supabase
          .from('experta_go_sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .gte('sale_date', `${today}T00:00:00.000Z`)
          .lt('sale_date', `${today}T23:59:59.999Z`);

        const totalSales = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
        const transactionCount = sales?.length || 0;
        const estimatedProfit = totalSales * (profitRate / 100);

        setData({
          totalSales,
          estimatedProfit,
          profitRate,
          transactionCount,
          isLoading: false,
        });
      } catch (error) {
        console.error('Erro ao buscar dados de lucro diário:', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDailyData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDailyData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return data;
};