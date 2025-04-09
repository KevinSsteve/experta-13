
import { DailySales } from '@/lib/sales';
import { formatShortDate, formatDate, formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';

interface SalesByTimeChartProps {
  data: DailySales[] | undefined;
  isLoading: boolean;
}

export const SalesByTimeChart = ({ data, isLoading }: SalesByTimeChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Vendas ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <ChartSkeleton />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
                tickFormatter={(value) => formatShortDate(value)}
              />
              <YAxis 
                yAxisId="left" 
                tickFormatter={(value) => `R$${value}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "sales") {
                    return [formatCurrency(value), "Vendas"];
                  }
                  return [value, "Transações"];
                }}
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="Vendas"
                stroke="#4CAF50"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transactions"
                name="Transações"
                stroke="#FEC6A1"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Não há dados de vendas disponíveis para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
