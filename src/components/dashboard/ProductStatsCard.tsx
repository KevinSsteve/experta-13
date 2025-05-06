
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopProductsChart } from './TopProductsChart';
import { LowStockProductsList } from './LowStockProductsList';
import { useAuthStatus } from '@/hooks/dashboard/useAuthStatus';
import { useLowStockProducts } from '@/hooks/dashboard/useLowStockProducts';
import { useTopProducts } from '@/hooks/dashboard/useTopProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProductStatsCard() {
  const { userId, isAuthReady } = useAuthStatus();
  const { 
    data: lowStockProducts, 
    isLoading: isLoadingLowStock 
  } = useLowStockProducts(userId, isAuthReady);
  
  const {
    data: topProducts,
    isLoading: isLoadingTopProducts
  } = useTopProducts(userId, isAuthReady);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Estatísticas de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="top-products">
            <TabsList className="mb-4">
              <TabsTrigger value="top-products">Produtos Populares</TabsTrigger>
              <TabsTrigger value="low-stock">Baixo Estoque</TabsTrigger>
            </TabsList>
            <TabsContent value="top-products">
              <TopProductsChart data={topProducts} isLoading={isLoadingTopProducts} />
            </TabsContent>
            <TabsContent value="low-stock">
              <LowStockProductsList data={lowStockProducts} isLoading={isLoadingLowStock} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
