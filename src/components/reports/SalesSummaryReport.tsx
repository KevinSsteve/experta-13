
import { useEffect, useState } from 'react';
import { Sale } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface SalesSummaryReportProps {
  sales: Sale[];
  dateRange: {
    from: Date;
    to: Date;
  };
  isLoading: boolean;
}

export const SalesSummaryReport = ({ sales, dateRange, isLoading }: SalesSummaryReportProps) => {
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  
  useEffect(() => {
    if (sales && sales.length > 0) {
      // Agrupar vendas por dia
      const salesByDay: { [key: string]: { date: string; total: number; count: number } } = {};
      
      sales.forEach((sale) => {
        const dateStr = new Date(sale.date).toISOString().split('T')[0];
        
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
      
      const sortedDailySales = Object.values(salesByDay).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setDailySales(sortedDailySales);
      
      // Agrupar por método de pagamento
      const paymentMethods: { [key: string]: number } = {};
      
      sales.forEach((sale) => {
        const method = sale.paymentMethod || 'Outro';
        
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0;
        }
        
        paymentMethods[method] += sale.total;
      });
      
      const paymentMethodsData = Object.entries(paymentMethods).map(([name, value]) => ({
        name,
        value
      }));
      
      setPaymentMethodData(paymentMethodsData);
    } else {
      setDailySales([]);
      setPaymentMethodData([]);
    }
  }, [sales]);

  // Calcular totais
  const totalSales = sales.reduce((total, sale) => total + sale.total, 0);
  const totalTransactions = sales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Cores para o gráfico de pizza
  const COLORS = ['#4CAF50', '#2196F3', '#FFB300', '#F44336', '#9C27B0'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} até {format(dateRange.to, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Número de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTransactions === 1 ? '1 venda' : `${totalTransactions} vendas`} no período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor médio por transação
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas Diárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailySales.length > 0 ? (
                <ChartContainer 
                  config={{
                    total: { color: "#4CAF50" },
                    count: { color: "#2196F3" }
                  }}
                >
                  <LineChart
                    data={dailySales}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[0, 'auto']}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => format(new Date(value as string), 'dd/MM/yyyy')}
                        />
                      }
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total"
                      stroke="#4CAF50"
                      name="Total (R$)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, fill: "#4CAF50" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="count"
                      stroke="#2196F3"
                      name="Transações"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, fill: "#2196F3" }}
                    />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhuma venda no período selecionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Total']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhuma venda no período selecionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
