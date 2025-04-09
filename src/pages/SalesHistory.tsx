
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { getSalesData } from '@/lib/sales';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileDown, ChevronDown, Eye, ArrowLeft, Receipt } from 'lucide-react';
import { Sale } from '@/lib/sales/types';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';

const SalesHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    console.log("Ver detalhes da venda:", sale);
  };
  
  const handleExportSales = () => {
    const salesData = filteredSales.map(sale => ({
      ID: sale.id,
      Data: formatDate(sale.date),
      Cliente: typeof sale.customer === 'string' ? sale.customer : 'Cliente não identificado',
      Total: formatCurrency(sale.total),
      'Método de Pagamento': sale.paymentMethod,
      Itens: sale.items
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
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>
                  Visualize e gerencie o histórico de vendas da sua loja.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar vendas..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Exportar
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportSales}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedSales.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>ID da Venda</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Método de Pagamento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {sale.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {typeof sale.customer === 'string' 
                            ? sale.customer 
                            : 'Cliente não identificado'}
                        </TableCell>
                        <TableCell>{sale.items || 0}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewSaleDetails(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <InvoiceModal 
                              sale={sale} 
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              } 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          variant="ghost"
                          className="gap-1 pl-2.5"
                          disabled={currentPage === 1}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </Button>
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 || 
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <PaginationItem>
                        <Button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          variant="ghost"
                          className="gap-1 pr-2.5"
                          disabled={currentPage === totalPages}
                        >
                          <span>Next</span>
                          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhuma venda encontrada para esta pesquisa.' : 'Nenhuma venda registrada ainda.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesHistory;
