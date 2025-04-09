
import { Product } from '@/lib/products-data';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';

interface TopProductsChartProps {
  data: Product[] | undefined;
  isLoading: boolean;
}

export const TopProductsChart = ({ data, isLoading }: TopProductsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <ChartSkeleton />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data?.map(product => ({
                name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
                price: product.price,
                stock: product.stock,
              }))}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "price") {
                    return [formatCurrency(value), "Preço"];
                  }
                  return [value, "Estoque"];
                }}
              />
              <Legend />
              <Bar dataKey="price" name="Preço" fill="#4CAF50" />
              <Bar dataKey="stock" name="Estoque" fill="#FEC6A1" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Não há dados de produtos disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
};
