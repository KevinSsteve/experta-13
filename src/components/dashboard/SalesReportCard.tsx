import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ChartBar, AlertCircle } from 'lucide-react';
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

  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['salesReport', dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) {
          console.error('Nenhum ID de usuário disponível para consulta de relatório de vendas');
          return [];
        }
        
        console.log('Buscando dados de relatório de vendas para usuário:', user.id);
        console.log('Intervalo de datas:', dateRange.from, 'até', dateRange.to);
        
        // Use a função do cliente para obter dados de vendas
        const data = await getSalesReportData(user.id, dateRange.from, dateRange.to);
        console.log('Dados de relatório de vendas recebidos:', data?.length || 0, 'registros');

        // Se não tivermos dados, retorne uma matriz vazia
        if (!data || data.length === 0) {
          console.log('Nenhum dado de vendas encontrado para o período selecionado');
          return [];
        }

        // Converter dados do Supabase para o tipo Sale antes do processamento
        const salesArray = data.map(sale => adaptSupabaseSale(sale));
        console.log('Dados de vendas adaptados:', salesArray.length, 'registros');
        
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
        
        const result = Object.values(salesByDay);
        console.log('Dados de vendas processados por dia:', result.length, 'dias');
        return result;
      } catch (error) {
        console.error('Erro na consulta do relatório de vendas:', error);
        toast.error('Erro ao carregar dados de vendas');
        throw error;
      }
    },
    enabled: !!user?.id, // Só execute a consulta se houver um usuário autenticado
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Função para mostrar um aviso quando não houver dados ou quando o usuário não estiver autenticado
  const renderAuthWarning = () => {
    if (!user) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Você não está autenticado</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Faça login para visualizar seus dados de vendas.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => navigate('/auth')}
              >
                Ir para página de login
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const exportToCSV = () => {
    if (!salesData || salesData.length === 0) return;

    // Create header and rows for CSV
    const headers = ['Data', 'Total de Vendas', 'Quantidade de Vendas'];
    const rows = salesData.map(day => [
      day.date,
      day.total.toFixed(2),
      day.count.toString()
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and link for download
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

  // Função para gerar relatório financeiro
  const generateFinancialReport = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      console.log('Generating financial report for user:', user.id);
      const days = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      console.log('Report period:', days, 'days');
      
      const report = await generateSalesReport(user.id, days);
      
      if (report) {
        console.log('Financial report generated successfully:', report);
        toast.success('Relatório financeiro gerado com sucesso');
        // Navigate to resultados page
        navigate('/resultados');
      } else {
        console.error('Failed to generate report - no data returned');
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
        {renderAuthWarning()}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-md mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Erro ao carregar dados</h3>
                <p className="text-sm text-red-700 mt-1">
                  Ocorreu um erro ao carregar os dados de vendas. Por favor, tente novamente.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Detalhes do erro: {String(error)}
                </p>
              </div>
            </div>
          </div>
        )}
      
        <div className="h-80">
          <SalesChart salesData={salesData} isLoading={isLoading} />
        </div>
        
        <SalesSummary salesData={salesData} />
      </CardContent>
    </Card>
  );
};
