
import { useState } from 'react';
import { Product } from '@/lib/products/types';
import { formatCurrency } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface StockReportProps {
  inStockProducts: Product[] | undefined;
  outOfStockProducts: Product[] | undefined;
  isLoading: boolean;
}

export const StockReport = ({ inStockProducts = [], outOfStockProducts = [], isLoading }: StockReportProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar produtos com base no termo de pesquisa
  const filteredInStock = inStockProducts?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredOutOfStock = outOfStockProducts?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Preparar dados para o gráfico de estoque por categoria
  const prepareStockByCategory = (products: Product[]) => {
    const categoryMap: { [key: string]: { category: string; stock: number; value: number } } = {};
    
    products.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          stock: 0,
          value: 0
        };
      }
      
      categoryMap[product.category].stock += product.stock;
      categoryMap[product.category].value += product.price * product.stock;
    });
    
    return Object.values(categoryMap).sort((a, b) => b.stock - a.stock);
  };

  // Preparar dados para o gráfico de pizza
  const preparePieChartData = () => {
    const total = (inStockProducts?.length || 0) + (outOfStockProducts?.length || 0);
    if (total === 0) return [];
    
    return [
      { name: 'Em estoque', value: inStockProducts?.length || 0 },
      { name: 'Sem estoque', value: outOfStockProducts?.length || 0 }
    ];
  };

  const stockByCategory = prepareStockByCategory(inStockProducts || []);
  const pieChartData = preparePieChartData();
  
  // Calcular totais
  const totalInStock = inStockProducts?.length || 0;
  const totalOutOfStock = outOfStockProducts?.length || 0;
  const totalProducts = totalInStock + totalOutOfStock;
  const percentInStock = totalProducts > 0 ? (totalInStock / totalProducts) * 100 : 0;
  
  // Valor total do estoque
  const stockValue = inStockProducts?.reduce((total, product) => total + (product.price * product.stock), 0) || 0;
  
  // Cores para o gráfico de pizza
  const COLORS = ['#4CAF50', '#F44336'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentInStock.toFixed(1)}% do total de produtos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos Sem Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOutOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(100 - percentInStock).toFixed(1)}% do total de produtos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Com base nos preços atuais
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum produto cadastrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {stockByCategory.length > 0 ? (
                <ChartContainer 
                  config={{
                    stock: { color: "#4CAF50" },
                    value: { color: "#2196F3" }
                  }}
                >
                  <BarChart
                    data={stockByCategory}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis 
                      yAxisId="left"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent />
                      }
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="stock" 
                      name="Quantidade" 
                      fill="#4CAF50" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="value" 
                      name="Valor (R$)" 
                      fill="#2196F3" 
                    />
                    <Legend />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum produto em estoque
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Detalhe do Estoque</h3>
          <div className="relative w-full md:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar produtos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="inStock">
          <TabsList className="mb-4">
            <TabsTrigger value="inStock">
              Em Estoque <Badge variant="secondary" className="ml-2">{filteredInStock.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="outOfStock">
              Sem Estoque <Badge variant="secondary" className="ml-2">{filteredOutOfStock.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inStock">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInStock.length > 0 ? (
                    filteredInStock.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price * product.stock)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum produto em estoque
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="outOfStock">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutOfStock.length > 0 ? (
                    filteredOutOfStock.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Nenhum produto sem estoque
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
