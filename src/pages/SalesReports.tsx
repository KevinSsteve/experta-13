
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, ChevronDown, Calendar } from 'lucide-react';
import { SalesSummaryReport } from '@/components/reports/SalesSummaryReport';
import { ProductSalesReport } from '@/components/reports/ProductSalesReport';
import { StockReport } from '@/components/reports/StockReport';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { formatCurrency } from '@/lib/utils';
import { getSalesData } from '@/lib/sales';
import { getProductsInStock, getOutOfStockProducts } from '@/lib/products/analytics';

const SalesReports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: () => getSalesData(user?.id),
    enabled: !!user?.id,
  });

  const { data: inStockProducts, isLoading: stockLoading } = useQuery({
    queryKey: ['productsInStock', user?.id],
    queryFn: () => getProductsInStock(user?.id),
    enabled: !!user?.id,
  });

  const { data: outOfStockProducts, isLoading: outOfStockLoading } = useQuery({
    queryKey: ['outOfStockProducts', user?.id],
    queryFn: () => getOutOfStockProducts(user?.id),
    enabled: !!user?.id,
  });

  // Filtrar vendas pelo intervalo de datas
  const filteredSales = sales?.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= dateRange.from && saleDate <= dateRange.to;
  }) || [];

  // Calcular totais
  const totalSales = filteredSales.reduce((total, sale) => total + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleExportData = () => {
    let exportData;
    let filename;

    if (activeTab === 'summary') {
      exportData = {
        periodo: `${dateRange.from.toLocaleDateString()} a ${dateRange.to.toLocaleDateString()}`,
        total_vendas: formatCurrency(totalSales),
        total_transacoes: totalTransactions,
        ticket_medio: formatCurrency(averageTicket),
        vendas: filteredSales
      };
      filename = `relatorio-vendas-resumo-${dateRange.from.toISOString().slice(0, 10)}-a-${dateRange.to.toISOString().slice(0, 10)}.json`;
    } else if (activeTab === 'products') {
      // Agregar vendas por produto
      const productSales: { [key: string]: { name: string; quantity: number; total: number } } = {};
      
      filteredSales.forEach(sale => {
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach(product => {
            const productName = product.name || 'Produto Sem Nome';
            const price = product.price || 0;
            const quantity = product.quantity || 1;
            
            if (!productSales[productName]) {
              productSales[productName] = {
                name: productName,
                quantity: 0,
                total: 0
              };
            }
            
            productSales[productName].quantity += quantity;
            productSales[productName].total += price * quantity;
          });
        }
      });
      
      exportData = Object.values(productSales);
      filename = `relatorio-vendas-produtos-${dateRange.from.toISOString().slice(0, 10)}-a-${dateRange.to.toISOString().slice(0, 10)}.json`;
    } else {
      // Relatório de estoque
      exportData = {
        produtos_em_estoque: inStockProducts,
        produtos_sem_estoque: outOfStockProducts
      };
      filename = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.json`;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Análise aprofundada de vendas e estoque para tomada de decisões
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DateRangePicker 
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
                <Button variant="outline" onClick={handleExportData}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Resumo de Vendas</TabsTrigger>
                <TabsTrigger value="products">Vendas por Produto</TabsTrigger>
                <TabsTrigger value="stock">Relatório de Estoque</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <SalesSummaryReport 
                  sales={filteredSales} 
                  dateRange={dateRange}
                  isLoading={salesLoading}
                />
              </TabsContent>
              
              <TabsContent value="products">
                <ProductSalesReport 
                  sales={filteredSales}
                  dateRange={dateRange}
                  isLoading={salesLoading}
                />
              </TabsContent>
              
              <TabsContent value="stock">
                <StockReport 
                  inStockProducts={inStockProducts}
                  outOfStockProducts={outOfStockProducts}
                  isLoading={stockLoading || outOfStockLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesReports;
