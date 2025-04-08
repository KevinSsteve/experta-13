
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getDailySales, 
  getSalesByCategory, 
  getSalesKPIs, 
  getRecentSales,
  DailySales,
  SalesByCategory,
  Sale
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
import { Product } from '@/contexts/CartContext';

const COLORS = ['#4CAF50', '#FEC6A1', '#FEF7CD', '#8E9196', '#2196F3', '#FFEB3B', '#9C27B0', '#FF5722'];

interface KPIs {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  revenueChange: number;
  salesChange: number;
  ticketChange: number;
}

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for all data
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  
  // Load all data based on selected time range
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        const days = parseInt(timeRange);
        
        // Load all data in parallel
        const [
          kpisData,
          dailySalesData,
          salesByCategoryData,
          recentSalesData,
          topProductsData,
          lowStockProductsData
        ] = await Promise.all([
          getSalesKPIs(days),
          getDailySales(days),
          getSalesByCategory(),
          getRecentSales(5),
          getTopSellingProducts(5),
          getLowStockProducts(10)
        ]);
        
        // Update state with all data
        setKpis(kpisData);
        setDailySales(dailySalesData);
        setSalesByCategory(salesByCategoryData);
        setRecentSales(recentSalesData);
        setTopProducts(topProductsData);
        setLowStockProducts(lowStockProductsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [timeRange]);
  
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

  if (isLoading || !kpis) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pb-20 flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-lg">Carregando dados do dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vendas ao longo do tempo</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {dailySales.length > 0 ? (
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
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Sem dados de vendas para exibir</p>
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
                {salesByCategory.length > 0 ? (
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
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Sem dados de categorias para exibir</p>
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
                {topProducts.length > 0 ? (
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
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Sem dados de produtos para exibir</p>
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
                {recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {sale.customer || "Cliente anônimo"}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(sale.date)} · {sale.paymentMethod || "Dinheiro"}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(sale.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {typeof sale.items === 'number' ? sale.items : Array.isArray(sale.items) ? sale.items.length : 0} {sale.items === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Nenhuma venda recente encontrada</p>
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
                {lowStockProducts.length > 0 ? (
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
                    <p>Sem produtos com estoque baixo</p>
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
