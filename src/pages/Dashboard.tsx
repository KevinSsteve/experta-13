
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { SalesByTimeChart } from '@/components/dashboard/SalesByTimeChart';
import { SalesByCategoryChart } from '@/components/dashboard/SalesByCategoryChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import { LowStockProductsList } from '@/components/dashboard/LowStockProductsList';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const {
    kpis,
    dailySales,
    salesByCategory,
    recentSales,
    topProducts,
    lowStockProducts
  } = useDashboardData(timeRange);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
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
