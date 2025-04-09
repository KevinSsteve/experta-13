
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/lib/sales/types';
import { formatCurrency } from '@/lib/utils';
import { adaptSupabaseSale } from '@/lib/sales/adapters';
import { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

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
      
      salesArray.forEach((sale: Sale) => {
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : salesData && salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                  labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#4CAF50" 
                  activeDot={{ r: 8 }} 
                  name="Total de Vendas"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Nenhum dado de venda encontrado para o período selecionado.</p>
              <p className="text-sm">Tente selecionar um período diferente.</p>
            </div>
          )}
        </div>
        
        {salesData && salesData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Sumário</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="bg-muted rounded-md p-3">
                <p className="text-xs text-muted-foreground">Total de Vendas</p>
                <p className="font-semibold">
                  {formatCurrency(salesData.reduce((acc, day) => acc + day.total, 0))}
                </p>
              </div>
              <div className="bg-muted rounded-md p-3">
                <p className="text-xs text-muted-foreground">Qtd. Transações</p>
                <p className="font-semibold">
                  {salesData.reduce((acc, day) => acc + day.count, 0)}
                </p>
              </div>
              <div className="bg-muted rounded-md p-3">
                <p className="text-xs text-muted-foreground">Média Diária</p>
                <p className="font-semibold">
                  {formatCurrency(salesData.reduce((acc, day) => acc + day.total, 0) / salesData.length)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
