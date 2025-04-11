
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
import { useIsMobile } from '@/hooks/use-mobile';

interface SalesByCategoryChartProps {
  data: SalesByCategory[] | undefined;
  isLoading: boolean;
}

const COLORS = ['#4CAF50', '#FEC6A1', '#FEF7CD', '#8E9196', '#2196F3', '#FFEB3B', '#9C27B0', '#FF5722'];

export const SalesByCategoryChart = ({ data, isLoading }: SalesByCategoryChartProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="pb-2 px-3 sm:px-6 py-3">
        <CardTitle className="text-base sm:text-lg">Vendas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-64' : 'h-80'} px-0 sm:px-2`}>
        {isLoading ? (
          <ChartSkeleton />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={isMobile ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 5, right: 5, bottom: 5, left: 5 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                label={isMobile ? undefined : ({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 60 : 80}
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
                contentStyle={isMobile ? { fontSize: '12px' } : undefined}
              />
              <Legend 
                layout={isMobile ? "horizontal" : "vertical"} 
                verticalAlign={isMobile ? "bottom" : "middle"}
                align={isMobile ? "center" : "right"}
                wrapperStyle={isMobile ? { fontSize: '10px', paddingTop: '10px' } : undefined}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Não há dados de categorias disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
