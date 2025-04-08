
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getDailySales, 
  getSalesByCategory, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales-data';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products-data';
import { formatCurrency, formatShortDate, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#4CAF50', '#FEC6A1', '#FEF7CD', '#8E9196', '#2196F3', '#FFEB3B', '#9C27B0', '#FF5722'];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const days = parseInt(timeRange);
  
  // Fetch data using React Query
  const { data: kpis, isLoading: isLoadingKpis } = useQuery({
    queryKey: ['salesKpis', days],
    queryFn: () => getSalesKPIs(days)
  });
  
  const { data: dailySales, isLoading: isLoadingDailySales } = useQuery({
    queryKey: ['dailySales', days],
    queryFn: () => getDailySales(days)
  });
  
  const { data: salesByCategory, isLoading: isLoadingSalesByCategory } = useQuery({
    queryKey: ['salesByCategory'],
    queryFn: () => getSalesByCategory()
  });
  
  const { data: recentSales, isLoading: isLoadingRecentSales } = useQuery({
    queryKey: ['recentSales'],
    queryFn: () => getRecentSales(5)
  });
  
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => getTopSellingProducts(5)
  });
  
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: () => getLowStockProducts(10)
  });
  
  // Function to render the trend indicator
  const renderTrendIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>+{value}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span>{value}%</span>
        </div>
      );
    } else {
      return (
        <div className="text-muted-foreground">
          0%
        </div>
      );
    }
  };
  
  // Loading skeleton for cards
  const KpiCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
        <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2"></div>
        <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
        <div className="h-3 w-40 bg-muted animate-pulse rounded"></div>
      </CardContent>
    </Card>
  );
  
  // Loading skeleton for charts
  const ChartSkeleton = () => (
    <div className="h-80 w-full flex items-center justify-center bg-muted/20 rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral das suas vendas e desempenho.</p>
            </div>
            
            <Tabs 
              value={timeRange} 
              onValueChange={setTimeRange} 
              className="mt-4 md:mt-0"
            >
              <TabsList>
                <TabsTrigger value="7">7 dias</TabsTrigger>
                <TabsTrigger value="30">30 dias</TabsTrigger>
                <TabsTrigger value="90">90 dias</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingKpis ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </>
            ) : kpis ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(kpis.totalRevenue)}
                    </div>
                    {renderTrendIndicator(kpis.revenueChange)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Comparado ao período anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Número de Vendas
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis.totalSales}</div>
                    {renderTrendIndicator(kpis.salesChange)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Comparado ao período anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ticket Médio
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(kpis.averageTicket)}
                    </div>
                    {renderTrendIndicator(kpis.ticketChange)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Comparado ao período anterior
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-3 text-center py-6 text-muted-foreground">
                Não foi possível carregar os dados de KPIs
              </div>
            )}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vendas ao longo do tempo</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingDailySales ? (
                  <ChartSkeleton />
                ) : dailySales && dailySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailySales}
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
            
            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingSalesByCategory ? (
                  <ChartSkeleton />
                ) : salesByCategory && salesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="category"
                      >
                        {salesByCategory.map((entry, index) => (
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
            
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingTopProducts ? (
                  <ChartSkeleton />
                ) : topProducts && topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts.map(product => ({
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
          </div>
          
          {/* Recent Sales and Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRecentSales ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentSales && recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {sale.customer || "Cliente anônimo"}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(sale.date)} · {sale.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(sale.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.items} {sale.items === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhuma venda recente encontrada
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Produtos com Baixo Estoque</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {isLoadingLowStock ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : lowStockProducts && lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(product.price)}
                          </p>
                          <p className={`text-xs ${
                            product.stock < 5 ? "text-red-500" : "text-amber-500"
                          }`}>
                            Restam {product.stock} unidades
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum produto com baixo estoque encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
