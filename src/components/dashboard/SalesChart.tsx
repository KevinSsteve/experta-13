
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  salesData: any[] | undefined;
  isLoading: boolean;
}

export const SalesChart = ({ salesData, isLoading }: SalesChartProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Carregando dados de vendas...</p>
        </div>
      </div>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">Nenhum dado de venda encontrado</p>
        <p className="text-sm mt-1">Tente selecionar um período diferente ou cadastrar vendas.</p>
      </div>
    );
  }

  // Log para depuração
  console.log('Dados para o gráfico (SalesChart):', salesData);

  // Garantir que temos os dados no formato correto antes de renderizar
  const formattedData = salesData.map(item => ({
    date: item.date,
    total: typeof item.total === 'number' ? item.total : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => {
            try {
              return format(new Date(date), 'dd/MM');
            } catch (e) {
              console.error('Erro ao formatar data:', date, e);
              return 'Data inválida';
            }
          }}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value).split(',')[0]}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          labelFormatter={(label) => {
            try {
              return format(new Date(label), 'dd/MM/yyyy');
            } catch (e) {
              console.error('Erro no formato da data no tooltip:', label, e);
              return String(label);
            }
          }}
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
