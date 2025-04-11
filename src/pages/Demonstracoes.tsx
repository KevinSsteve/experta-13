
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

interface SaleItem {
  id?: string;
  product?: {
    id: string;
    price: number;
  };
  quantity?: number;
  price?: number;
}

const Demonstracoes = () => {
  const [timeRange, setTimeRange] = useState('30');
  const { user } = useAuth();
  const userId = user?.id;

  // Query para buscar os dados de vendas
  const salesQuery = useQuery({
    queryKey: ['vendasDemonstracao', timeRange, userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const days = parseInt(timeRange);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Buscar todas as vendas no período
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Calcular os totais
      const totalVendas = sales ? sales.length : 0;
      const totalFaturamento = sales ? sales.reduce((sum, sale) => sum + Number(sale.total), 0) : 0;
      
      // Buscar produtos para calcular o lucro
      const { data: products } = await supabase
        .from('products')
        .select('id, price, purchase_price');
      
      // Mapa de produtos para acesso rápido
      const productMap = products ? products.reduce((map, product) => {
        map[product.id] = {
          price: product.price,
          purchase_price: product.purchase_price || 0
        };
        return map;
      }, {} as Record<string, { price: number, purchase_price: number }>) : {};
      
      // Calcular o lucro baseado nos items vendidos
      let lucroTotal = 0;
      
      if (sales && sales.length > 0) {
        sales.forEach(sale => {
          // Parse items carefully handling the JSON format from Supabase
          let itemsArray: SaleItem[] = [];
          
          try {
            // Check if items is a JSON string that needs parsing or already an array
            if (typeof sale.items === 'string') {
              itemsArray = JSON.parse(sale.items);
            } else if (Array.isArray(sale.items)) {
              itemsArray = sale.items;
            } else if (sale.items && typeof sale.items === 'object' && sale.items.products) {
              // If items is an object with products property
              itemsArray = Array.isArray(sale.items.products) ? sale.items.products : [];
            }
          } catch (e) {
            console.error('Error parsing sale items:', e);
            itemsArray = [];
          }
          
          // Process each item to calculate profit
          itemsArray.forEach(item => {
            if (!item) return;
            
            // Safely access properties with type checking
            const productId = item.product?.id || (typeof item === 'object' && 'id' in item ? item.id : undefined);
            const quantity = item.quantity || 1;
            
            if (!productId) return;
            
            const productInfo = productMap[productId];
            
            if (productInfo) {
              const precoVenda = item.price || (item.product?.price) || productInfo.price;
              const precoCusto = productInfo.purchase_price;
              const lucroItem = (precoVenda - precoCusto) * quantity;
              lucroTotal += lucroItem;
            }
          });
        });
      }
      
      return {
        totalVendas,
        totalFaturamento,
        lucroTotal
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data, isLoading, error } = salesQuery;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Demonstrações Financeiras</h1>
        
        <Tabs 
          value={timeRange} 
          onValueChange={setTimeRange}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="7">7 dias</TabsTrigger>
            <TabsTrigger value="30">30 dias</TabsTrigger>
            <TabsTrigger value="90">90 dias</TabsTrigger>
            <TabsTrigger value="365">1 ano</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading && (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 mb-6">
            <p>Erro ao carregar os dados: {error.message}</p>
          </div>
        )}
        
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
                  Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.totalVendas}</p>
                <p className="text-sm text-muted-foreground">transações no período</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
                  Total em Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(data.totalFaturamento)}</p>
                <p className="text-sm text-muted-foreground">receita bruta no período</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(data.lucroTotal)}</p>
                <p className="text-sm text-muted-foreground">lucratividade no período</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Demonstracoes;
