
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ChartBar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase, getSalesReportData, generateSalesReport } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { adaptSupabaseSale } from '@/lib/sales/adapters';
import { useAuth } from '@/contexts/AuthContext';
import { DateRangePicker } from './DateRangePicker';
import { SalesChart } from './SalesChart';
import { SalesSummary } from './SalesSummary';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const SalesReportCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['salesReport', dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) {
          console.error('No user ID available for sales report query');
          return [];
        }
        
        // Use the new client function to get sales data
        const data = await getSalesReportData(user.id, dateRange.from, dateRange.to);

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
      } catch (error) {
        console.error('Error in sales report query:', error);
        return [];
      }
    },
    enabled: !!user?.id, // Só executa a query se houver um usuário autenticado
    retry: false
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

  // New function to generate financial report and navigate to results
  const generateFinancialReport = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      const days = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const report = await generateSalesReport(user.id, days);
      
      if (report) {
        toast.success('Relatório financeiro gerado com sucesso');
        // Navigate to resultados page
        navigate('/resultados');
      } else {
        toast.error('Não foi possível gerar o relatório. Verifique se há dados suficientes.');
      }
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast.error('Erro ao gerar relatório financeiro');
    } finally {
      setIsGeneratingReport(false);
    }
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
          
          <Button 
            variant="default" 
            size="sm" 
            className="h-8" 
            onClick={generateFinancialReport}
            disabled={isLoading || isGeneratingReport || !salesData || salesData.length === 0}
          >
            <ChartBar className="h-4 w-4 mr-2" />
            {isGeneratingReport ? 'Gerando...' : 'Resultados'}
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
