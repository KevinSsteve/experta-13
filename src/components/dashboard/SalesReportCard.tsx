
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { adaptSupabaseSale } from '@/lib/sales/adapters';
import { useAuth } from '@/contexts/AuthContext';
import { DateRangePicker } from './DateRangePicker';
import { SalesChart } from './SalesChart';
import { SalesSummary } from './SalesSummary';

export const SalesReportCard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['salesReport', dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*')
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: true });
      
      // Filtrar por usuário se estiver autenticado
      if (user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados de vendas:', error);
        throw error;
      }

      // Se não temos dados, retornar array vazio
      if (!data || data.length === 0) {
        return [];
      }

      // Convert Supabase data to Sale type before processing
      const salesArray = data.map(sale => adaptSupabaseSale(sale));
      
      // Agrupar vendas por dia
      const salesByDay: { [key: string]: { date: string; total: number; count: number } } = {};
      
      salesArray.forEach((sale) => {
        const dateStr = format(new Date(sale.date), 'yyyy-MM-dd');
        
        if (!salesByDay[dateStr]) {
          salesByDay[dateStr] = {
            date: dateStr,
            total: 0,
            count: 0
          };
        }
        
        salesByDay[dateStr].total += sale.total;
        salesByDay[dateStr].count += 1;
      });
      
      return Object.values(salesByDay);
    },
    enabled: !!user // Só executa a query se houver um usuário autenticado
  });

  const exportToCSV = () => {
    if (!salesData || salesData.length === 0) return;

    // Criar cabeçalho e linhas para o CSV
    const headers = ['Data', 'Total de Vendas', 'Quantidade de Vendas'];
    const rows = salesData.map(day => [
      day.date,
      day.total.toFixed(2),
      day.count.toString()
    ]);

    // Combinar cabeçalho e linhas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-vendas-${format(dateRange.from, 'yyyy-MM-dd')}-a-${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Relatório de Vendas
        </CardTitle>
        <div className="flex items-center space-x-2">
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={exportToCSV}
            disabled={isLoading || !salesData || salesData.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <SalesChart salesData={salesData} isLoading={isLoading} />
        </div>
        
        <SalesSummary salesData={salesData} />
      </CardContent>
    </Card>
  );
};
