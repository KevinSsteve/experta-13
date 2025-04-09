import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { getSalesData } from '@/lib/sales';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { downloadReceipt } from '@/lib/utils/receipt';
import { toast } from 'sonner';
import { Sale } from '@/lib/sales/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SalesTable } from '@/components/sales/SalesTable';
import { SalesCardList } from '@/components/sales/SalesCardList';
import { SalesSearch } from '@/components/sales/SalesSearch';
import { SalesPagination } from '@/components/sales/SalesPagination';
import { SalesHistorySkeleton } from '@/components/sales/SalesHistorySkeleton';

const SalesHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: () => getSalesData(user?.id),
    enabled: !!user?.id,
  });
  
  const filteredSales = sales?.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.id.toLowerCase().includes(searchLower) ||
      (sale.customer && typeof sale.customer === 'string' && 
        sale.customer.toLowerCase().includes(searchLower)) ||
      sale.paymentMethod.toLowerCase().includes(searchLower) ||
      formatDate(sale.date).includes(searchLower)
    );
  }) || [];
  
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleViewSaleDetails = (sale: Sale) => {
    navigate(`/sales-history/${sale.id}`);
  };
  
  const handlePrintReceipt = (sale: Sale, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar navegação para detalhes
    try {
      downloadReceipt(sale);
      toast.success('Recibo gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      toast.error('Erro ao gerar recibo');
    }
  };
  
  const handleExportSales = () => {
    const salesData = filteredSales.map(sale => ({
      ID: sale.id,
      Data: formatDate(sale.date),
      Cliente: typeof sale.customer === 'string' ? sale.customer : 'Cliente não identificado',
      Total: formatCurrency(sale.total),
      'Método de Pagamento': sale.paymentMethod,
      Itens: typeof sale.items === 'number' ? sale.items : sale.items.length
    }));
    
    const dataStr = JSON.stringify(salesData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vendas_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-4 md:py-6">
          <SalesHistorySkeleton />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-4 md:py-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-3">
              <div>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>
                  Visualize e gerencie o histórico de vendas da sua loja.
                </CardDescription>
              </div>
              <SalesSearch 
                searchTerm={searchTerm} 
                onSearchChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                onExport={handleExportSales}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <SalesCardList 
                sales={paginatedSales} 
                onViewSaleDetails={handleViewSaleDetails} 
                onPrintReceipt={handlePrintReceipt}
              />
            ) : (
              <SalesTable 
                sales={paginatedSales} 
                onViewSaleDetails={handleViewSaleDetails} 
                onPrintReceipt={handlePrintReceipt}
              />
            )}
            <SalesPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesHistory;
