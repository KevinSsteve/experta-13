
import { SalesByCategory } from '@/lib/sales';
import { formatCurrency } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';

interface SalesByCategoryChartProps {
  data: SalesByCategory[] | undefined;
  isLoading: boolean;
}

const COLORS = ['#4CAF50', '#FEC6A1', '#FEF7CD', '#8E9196', '#2196F3', '#FFEB3B', '#9C27B0', '#FF5722'];

export const SalesByCategoryChart = ({ data, isLoading }: SalesByCategoryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <ChartSkeleton />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Não há dados de categorias disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
};
