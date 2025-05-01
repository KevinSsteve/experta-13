
import React, { useEffect, useState } from 'react';
import { ButcherLayout } from '@/components/layouts/ButcherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Beef, DollarSign, ShoppingCart, Clock, Tag, Package, AlertTriangle } from 'lucide-react';
import { MeatProduct, MeatProductCard } from '@/components/butcher/MeatProductCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Mock data for the dashboard
const mockSalesData = [
  { day: 'Seg', sales: 4500 },
  { day: 'Ter', sales: 5200 },
  { day: 'Qua', sales: 4800 },
  { day: 'Qui', sales: 6000 },
  { day: 'Sex', sales: 7500 },
  { day: 'Sáb', sales: 9200 },
  { day: 'Dom', sales: 3500 },
];

const mockProductData = [
  { name: 'Picanha', sales: 35 },
  { name: 'Alcatra', sales: 28 },
  { name: 'Filé Mignon', sales: 26 },
  { name: 'Costela', sales: 22 },
  { name: 'Linguiça', sales: 18 },
];

export default function ButcherDashboard() {
  const { user } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState<MeatProduct[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<MeatProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    averageTicket: 0,
    weeklyRevenue: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, these would be actual database queries
        // For now, we'll simulate loading and then provide some sample data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock products that are low on stock
        const mockLowStockProducts: MeatProduct[] = [
          {
            id: '1',
            name: 'Picanha Premium',
            animalType: 'beef',
            cutType: 'rump',
            pricePerKg: 89.90,
            stock: 2.5,
            expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in the future
          },
          {
            id: '2',
            name: 'Filé Mignon',
            animalType: 'beef',
            cutType: 'filet',
            pricePerKg: 99.90,
            stock: 1.8,
            expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days in the future
          }
        ];
        
        // Mock products that are expiring soon
        const mockExpiringProducts: MeatProduct[] = [
          {
            id: '3',
            name: 'Costela Suína',
            animalType: 'pork',
            cutType: 'ribs',
            pricePerKg: 39.90,
            stock: 7.5,
            expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in the future
          },
          {
            id: '4',
            name: 'Peito de Frango',
            animalType: 'chicken',
            cutType: 'breast',
            pricePerKg: 22.90,
            stock: 5.2,
            expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in the future
          }
        ];
        
        // Set the retrieved data
        setLowStockProducts(mockLowStockProducts);
        setExpiringProducts(mockExpiringProducts);
        
        // Mock stats
        setStats({
          totalProducts: 42,
          totalSales: 53,
          averageTicket: 187.35,
          weeklyRevenue: 9925.75
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return (
    <ButcherLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Talho</h1>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Produtos em Estoque</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Vendas (Hoje)</p>
                <p className="text-2xl font-bold">{stats.totalSales}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageTicket)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Receita Semanal</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.weeklyRevenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Vendas na Semana</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Vendas']} />
                  <Bar dataKey="sales" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={mockProductData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#FEC6A1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Produtos com Baixo Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map(product => (
                <MeatProductCard key={product.id} product={product} />
              ))}
              
              {lowStockProducts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto opacity-20 mb-2" />
                  <p>Não há produtos com baixo estoque</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Produtos Próximos ao Vencimento</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringProducts.map(product => (
                <MeatProductCard key={product.id} product={product} />
              ))}
              
              {expiringProducts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto opacity-20 mb-2" />
                  <p>Não há produtos próximos ao vencimento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ButcherLayout>
  );
}
