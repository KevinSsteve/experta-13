
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  salesData: any[] | undefined;
  isLoading: boolean;
}

export const SalesChart = ({ salesData, isLoading }: SalesChartProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Nenhum dado de venda encontrado para o período selecionado.</p>
        <p className="text-sm">Tente selecionar um período diferente ou cadastrar vendas.</p>
      </div>
    );
  }

  // Make sure we have the data in the right format
  console.log('Chart data:', salesData);

  return (
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
  );
};
