
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';
import { useIsMobile } from '@/hooks/use-mobile';

interface SalesChartProps {
  salesData: any[] | undefined;
  isLoading: boolean;
}

export const SalesChart = ({ salesData, isLoading }: SalesChartProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">Nenhum dado encontrado</p>
        <p className="text-sm mt-1">Tente selecionar outro período.</p>
      </div>
    );
  }

  const formattedData = salesData.map(item => ({
    date: item.date,
    total: typeof item.total === 'number' ? item.total : 0,
    profit: typeof item.profit === 'number' ? item.profit : 0,
  }));

  return (
    <ResponsiveWrapper
      className="w-full"
      mobileClassName="h-60"
      desktopClassName="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), isMobile ? 'dd/MM' : 'dd/MM/yyyy')}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            tickFormatter={(value) => isMobile ? `${formatCurrency(value).split(',')[0]}` : formatCurrency(value)}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 50 : 80}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Valor']}
            labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#4CAF50" 
            name="Vendas"
            strokeWidth={2}
            dot={!isMobile}
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#2196F3" 
            name="Lucro"
            strokeWidth={2}
            dot={!isMobile}
          />
        </LineChart>
      </ResponsiveContainer>
    </ResponsiveWrapper>
  );
};
