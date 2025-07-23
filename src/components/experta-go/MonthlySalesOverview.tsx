import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { generateMonthlySalesReport } from '@/lib/reports/monthly-sales-report';
import { toast } from 'sonner';

interface DailySalesSummary {
  date: Date;
  totalSales: number;
  totalRevenue: number;
  transactionCount: number;
}

interface MonthlySalesData {
  dailySales: DailySalesSummary[];
  totalRevenue: number;
  totalTransactions: number;
  averageDailyRevenue: number;
  bestDay: DailySalesSummary | null;
  worstDay: DailySalesSummary | null;
}

export const MonthlySalesOverview = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: monthlySalesData, isLoading } = useQuery({
    queryKey: ['monthlySales', user?.id, selectedMonth.getMonth(), selectedMonth.getFullYear()],
    queryFn: async (): Promise<MonthlySalesData> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      const { data: sales, error } = await supabase
        .from('experta_go_sales')
        .select('total_amount, sale_date')
        .eq('user_id', user.id)
        .gte('sale_date', monthStart.toISOString())
        .lte('sale_date', monthEnd.toISOString())
        .order('sale_date', { ascending: true });

      if (error) throw error;

      // Criar um resumo por dia
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const dailySales: DailySalesSummary[] = daysInMonth.map(date => {
        const daySales = sales?.filter(sale => 
          isSameDay(new Date(sale.sale_date), date)
        ) || [];

        const totalRevenue = daySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
        
        return {
          date,
          totalSales: totalRevenue,
          totalRevenue,
          transactionCount: daySales.length
        };
      });

      const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const totalTransactions = sales?.length || 0;
      const averageDailyRevenue = totalRevenue / daysInMonth.length;

      const salesDays = dailySales.filter(day => day.transactionCount > 0);
      const bestDay = salesDays.length > 0 ? salesDays.reduce((best, current) => 
        current.totalRevenue > best.totalRevenue ? current : best
      ) : null;
      
      const worstDay = salesDays.length > 0 ? salesDays.reduce((worst, current) => 
        current.totalRevenue < worst.totalRevenue ? current : worst
      ) : null;

      return {
        dailySales,
        totalRevenue,
        totalTransactions,
        averageDailyRevenue,
        bestDay,
        worstDay
      };
    },
    enabled: !!user?.id,
  });

  const handleGeneratePDF = async () => {
    if (!monthlySalesData) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateMonthlySalesReport(monthlySalesData, selectedMonth);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o relatório PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const getRevenueColor = (revenue: number, average: number) => {
    if (revenue === 0) return 'text-muted-foreground';
    if (revenue >= average * 1.2) return 'text-green-600';
    if (revenue <= average * 0.5) return 'text-red-600';
    return 'text-foreground';
  };

  const getRevenueIcon = (revenue: number, average: number) => {
    if (revenue >= average * 1.2) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (revenue <= average * 0.5) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vendas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vendas do Mês
          </CardTitle>
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF || !monthlySalesData}
            size="sm"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            ←
          </Button>
          <span className="font-medium">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            →
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {monthlySalesData && (
          <>
            {/* Resumo do mês */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total do Mês</div>
                <div className="font-bold text-lg">
                  {monthlySalesData.totalRevenue.toLocaleString('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Transações</div>
                <div className="font-bold text-lg">{monthlySalesData.totalTransactions}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Média Diária</div>
                <div className="font-bold text-lg">
                  {monthlySalesData.averageDailyRevenue.toLocaleString('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Melhor Dia</div>
                <div className="font-bold text-lg">
                  {monthlySalesData.bestDay ? 
                    format(monthlySalesData.bestDay.date, 'dd/MM') : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Calendário de vendas */}
            <div className="space-y-2">
              <h4 className="font-medium">Vendas por Dia</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {monthlySalesData.dailySales.map((day, index) => {
                  const revenueColor = getRevenueColor(day.totalRevenue, monthlySalesData.averageDailyRevenue);
                  const revenueIcon = getRevenueIcon(day.totalRevenue, monthlySalesData.averageDailyRevenue);
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 border rounded-md min-h-[60px] flex flex-col justify-between hover:bg-muted/50 transition-colors ${
                        day.transactionCount > 0 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {format(day.date, 'd')}
                        </span>
                        {revenueIcon}
                      </div>
                      
                      {day.transactionCount > 0 && (
                        <div className="space-y-1">
                          <div className={`text-xs font-medium ${revenueColor}`}>
                            {day.totalRevenue.toLocaleString('pt-AO', {
                              style: 'currency',
                              currency: 'AOA',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}
                          </div>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {day.transactionCount}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};