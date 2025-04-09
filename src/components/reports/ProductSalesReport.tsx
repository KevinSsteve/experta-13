
import { useEffect, useState } from 'react';
import { Sale } from '@/lib/sales/types';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface ProductSalesReportProps {
  sales: Sale[];
  dateRange: {
    from: Date;
    to: Date;
  };
  isLoading: boolean;
}

interface ProductSalesData {
  name: string;
  quantity: number;
  total: number;
}

export const ProductSalesReport = ({ sales, dateRange, isLoading }: ProductSalesReportProps) => {
  const [productSales, setProductSales] = useState<ProductSalesData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (sales && sales.length > 0) {
      // Agregar vendas por produto
      const productMap: { [key: string]: ProductSalesData } = {};
      
      sales.forEach(sale => {
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach(product => {
            const productName = product.name || 'Produto Sem Nome';
            const price = product.price || 0;
            const quantity = product.quantity || 1;
            
            if (!productMap[productName]) {
              productMap[productName] = {
                name: productName,
                quantity: 0,
                total: 0
              };
            }
            
            productMap[productName].quantity += quantity;
            productMap[productName].total += price * quantity;
          });
        }
      });
      
      // Converter para array e ordenar por total
      const productsList = Object.values(productMap).sort((a, b) => b.total - a.total);
      setProductSales(productsList);
    } else {
      setProductSales([]);
    }
  }, [sales]);

  // Filtrar produtos com base no termo de pesquisa
  const filteredProducts = productSales.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top 10 produtos para o gráfico
  const top10Products = filteredProducts.slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar produtos..."
          className="pl-8 w-full md:w-[250px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {top10Products.length > 0 ? (
              <ChartContainer 
                config={{
                  total: { color: "#4CAF50" },
                  quantity: { color: "#2196F3" }
                }}
              >
                <BarChart
                  data={top10Products}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 100,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 'auto']}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent />
                    }
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="total" 
                    name="Total (R$)" 
                    fill="#4CAF50" 
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="quantity" 
                    name="Quantidade" 
                    fill="#2196F3" 
                  />
                  <Legend />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum produto vendido no período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Detalhamento de Vendas por Produto</h3>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.total)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
