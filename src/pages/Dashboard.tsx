
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/dashboard/DashboardKPIs";
import { LowStockProductsList } from "@/components/dashboard/LowStockProductsList";
import { RecentSalesList } from "@/components/dashboard/RecentSalesList";
import { SalesByCategoryChart } from "@/components/dashboard/SalesByCategoryChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StockAlertsBanner } from "@/components/dashboard/StockAlertsBanner";
import { ExpensesSection } from "@/components/dashboard/ExpensesSection";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <StockAlertsBanner />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard />
          <ExpensesSection />
          <Card className="p-4 bg-background">
            <SalesByCategoryChart />
          </Card>
        </div>

        <Tabs defaultValue="recent-sales">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent-sales">Vendas Recentes</TabsTrigger>
            <TabsTrigger value="low-stock">Estoque Baixo</TabsTrigger>
          </TabsList>
          <TabsContent value="recent-sales">
            <RecentSalesList />
          </TabsContent>
          <TabsContent value="low-stock">
            <LowStockProductsList />
          </TabsContent>
        </Tabs>

        <div className="w-full">
          <SalesChart />
        </div>
      </div>
    </MainLayout>
  );
}
