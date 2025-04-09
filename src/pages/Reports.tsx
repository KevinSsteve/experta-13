
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesReportGenerator } from '@/components/reports/SalesReportGenerator';
import { InventoryReportGenerator } from '@/components/reports/InventoryReportGenerator';
import { ProfitReportGenerator } from '@/components/reports/ProfitReportGenerator';
import { FileText, ChartBar, ChartLine, Printer } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Relatórios</h1>
              <p className="text-muted-foreground">Gere relatórios detalhados para análise do seu negócio</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                <span className="hidden sm:inline">Vendas</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Estoque</span>
              </TabsTrigger>
              <TabsTrigger value="profit" className="flex items-center gap-2">
                <ChartLine className="h-4 w-4" />
                <span className="hidden sm:inline">Lucros</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesReportGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryReportGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Lucros</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfitReportGenerator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
