
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { SalesByTimeChart } from '@/components/dashboard/SalesByTimeChart';
import { SalesByCategoryChart } from '@/components/dashboard/SalesByCategoryChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import { LowStockProductsList } from '@/components/dashboard/LowStockProductsList';
import { SalesReportCard } from '@/components/dashboard/SalesReportCard';
import { StockAlertsBanner } from '@/components/dashboard/StockAlertsBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { testPermissions } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const {
    kpis,
    dailySales,
    salesByCategory,
    recentSales,
    topProducts,
    lowStockProducts
  } = useDashboardData(timeRange);

  const handleTestPermissions = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para testar permissões");
      return;
    }
    
    setIsTesting(true);
    try {
      const results = await testPermissions();
      console.log("Resultados do teste de permissões:", results);
      
      if (results.products.success && results.sales.success && results.profile.success) {
        toast.success("Permissões OK! Verifique o console para detalhes.");
      } else {
        toast.error("Algumas permissões falharam. Verifique o console.");
      }
    } catch (error) {
      console.error("Erro ao testar permissões:", error);
      toast.error("Erro ao testar permissões");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral das suas vendas e desempenho.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 items-start mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestPermissions}
                disabled={isTesting || !user}
              >
                {isTesting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando</>
                ) : (
                  'Testar Permissões'
                )}
              </Button>
              
              <Tabs 
                value={timeRange} 
                onValueChange={setTimeRange} 
              >
                <TabsList>
                  <TabsTrigger value="7">7 dias</TabsTrigger>
                  <TabsTrigger value="30">30 dias</TabsTrigger>
                  <TabsTrigger value="90">90 dias</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Alertas de estoque baixo */}
          <StockAlertsBanner />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardKPIs 
              data={kpis.data} 
              isLoading={kpis.isLoading} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesByTimeChart 
              data={dailySales.data} 
              isLoading={dailySales.isLoading} 
            />
            
            <SalesByCategoryChart 
              data={salesByCategory.data} 
              isLoading={salesByCategory.isLoading} 
            />
            
            <TopProductsChart 
              data={topProducts.data} 
              isLoading={topProducts.isLoading} 
            />
            
            {/* Novo componente de relatório de vendas */}
            <SalesReportCard />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentSalesList 
              data={recentSales.data} 
              isLoading={recentSales.isLoading} 
            />
            
            <LowStockProductsList 
              data={lowStockProducts.data} 
              isLoading={lowStockProducts.isLoading} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
