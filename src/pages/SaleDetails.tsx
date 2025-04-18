import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { getSalesData } from '@/lib/sales';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { downloadReceipt, printReceipt, shareReceipt, downloadThermalReceipt } from '@/lib/utils/receipt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  FileText,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomerInfo } from '@/lib/sales/types';
import { ExtendedProfile } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';

const SaleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<ExtendedProfile | undefined>(undefined);
  
  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales', user?.id],
    queryFn: () => getSalesData(user?.id),
    enabled: !!user?.id,
  });
  
  const sale = sales?.find(s => s.id === id);
  
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (user?.id) {
        console.log("Loading company profile for user:", user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          console.log("Company profile loaded:", data);
          setCompanyProfile(data as ExtendedProfile);
        } else {
          console.error("Error loading company profile:", error);
        }
      }
    };
    
    loadCompanyProfile();
  }, [user]);
  
  const handleBack = () => {
    navigate('/sales-history');
  };
  
  const handlePrint = () => {
    if (!sale) return;
    
    setIsPrinting(true);
    try {
      console.log("Printing receipt with company profile:", companyProfile);
      printReceipt(sale, companyProfile);
      toast.success('Recibo enviado para impressão');
    } catch (error) {
      console.error('Erro ao imprimir recibo:', error);
      toast.error('Erro ao imprimir recibo');
    } finally {
      setIsPrinting(false);
    }
  };
  
  const handleDownload = () => {
    if (!sale) return;
    
    setIsDownloading(true);
    try {
      console.log("Downloading receipt with company profile:", companyProfile);
      downloadReceipt(sale, companyProfile);
      toast.success('Recibo baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar recibo:', error);
      toast.error('Erro ao baixar recibo');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleDownloadThermal = () => {
    if (!sale) return;
    
    setIsDownloading(true);
    try {
      console.log("Downloading thermal receipt with company profile:", companyProfile);
      downloadThermalReceipt(sale, companyProfile);
      toast.success('Recibo térmico baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar recibo térmico:', error);
      toast.error('Erro ao baixar recibo térmico');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleShare = async () => {
    if (!sale) return;
    
    setIsSharing(true);
    try {
      console.log("Sharing receipt with company profile:", companyProfile);
      const shared = await shareReceipt(sale, companyProfile);
      
      if (shared) {
        toast.success('Recibo compartilhado com sucesso');
      } else {
        toast.info('O recibo foi baixado porque o compartilhamento não está disponível');
      }
    } catch (error) {
      console.error('Erro ao compartilhar recibo:', error);
      toast.error('Erro ao compartilhar recibo');
    } finally {
      setIsSharing(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-40" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
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
        </div>
      </MainLayout>
    );
  }
  
  if (!sale) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Venda não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível encontrar os detalhes desta venda.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para histórico
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  let customerName = 'Cliente não identificado';
  
  if (sale.customer) {
    if (typeof sale.customer === 'object') {
      customerName = (sale.customer as CustomerInfo).name || 'Cliente não identificado';
    } else if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    }
  }
  
  const saleItems = (() => {
    if (!sale.items) return [];
    
    if (Array.isArray(sale.items)) {
      return sale.items;
    }
    
    if (typeof sale.items === 'number') {
      return [];
    }
    
    if (typeof sale.items === 'object') {
      if ('products' in sale.items && Array.isArray((sale.items as any).products)) {
        const products = (sale.items as any).products;
        return products.map((item: any) => ({
          product: {
            id: item.productId || '',
            name: item.productName || '',
            price: item.price || 0,
            category: item.category || '',
            image: item.image || undefined
          },
          quantity: item.quantity || 1
        }));
      }
    }
    
    return [];
  })();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Detalhes da Venda</CardTitle>
                  <CardDescription>
                    Informações completas sobre a transação
                  </CardDescription>
                </div>
                <Badge variant="outline" className="md:self-start">
                  {formatDate(sale.date)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">ID da Venda</h3>
                      <p className="font-mono text-sm">{sale.id}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
                      <p>{customerName}</p>
                      
                      {typeof sale.customer === 'object' && sale.customer && (
                        <div className="mt-1 text-sm">
                          {(sale.customer as CustomerInfo).phone && (
                            <p>Tel: {(sale.customer as CustomerInfo).phone}</p>
                          )}
                          {(sale.customer as CustomerInfo).email && (
                            <p>Email: {(sale.customer as CustomerInfo).email}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Método de Pagamento</h3>
                      <p>{sale.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                      <p className="text-xl font-semibold">{formatCurrency(sale.total)}</p>
                    </div>
                    
                    {typeof sale.amountPaid === 'number' && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Valor Pago</h3>
                          <p>{formatCurrency(sale.amountPaid)}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Troco</h3>
                          <p>{formatCurrency(sale.amountPaid - sale.total)}</p>
                        </div>
                      </>
                    )}
                    
                    {sale.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                        <p className="text-sm">{sale.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Itens da Venda</h3>
                  
                  {saleItems.length > 0 ? (
                    <div className="space-y-3">
                      {saleItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="flex items-center">
                            {item.product?.image && (
                              <div className="h-12 w-12 bg-muted rounded overflow-hidden mr-3">
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name || 'Produto'}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.product?.price || 0)} × {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Detalhes dos itens não disponíveis
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 sm:flex-initial"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 sm:flex-initial"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadThermal}
                disabled={isDownloading}
                className="flex-1 sm:flex-initial"
              >
                <FileText className="mr-2 h-4 w-4" />
                Baixar Texto
              </Button>
              
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1 sm:flex-initial"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SaleDetails;
