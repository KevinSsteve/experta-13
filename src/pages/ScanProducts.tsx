
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { QRScanner } from '@/components/scanner/QRScanner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Scan, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';

const ScanProducts = () => {
  const [recentScans, setRecentScans] = useState<{ code: string; timestamp: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProductFound = async (productCode: string) => {
    if (!productCode) return;
    
    setIsLoading(true);
    try {
      // Adicionar a lista de scans recentes
      setRecentScans(prev => {
        const newScans = [{ code: productCode, timestamp: Date.now() }, ...prev];
        return newScans.slice(0, 5); // Manter apenas os 5 mais recentes
      });
      
      // Buscar produto pelo código
      let { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('code', productCode);
        
      if (error) {
        throw error;
      }

      if (product && product.length > 0) {
        // Adicionar o produto ao carrinho
        addItem(product[0]);
        toast.success(`${product[0].name} adicionado ao carrinho`);
      } else {
        toast.error('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Erro ao processar o código QR');
    } finally {
      setIsLoading(false);
    }
  };

  const goToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <header className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <Button onClick={goToCheckout} className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span>Checkout</span>
          </Button>
        </header>

        <ResponsiveWrapper>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                <span>Scanner de Produtos</span>
              </CardTitle>
              <CardDescription>
                Escaneie o código QR de um produto para adicioná-lo ao carrinho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRScanner onProductFound={handleProductFound} />
              
              {recentScans.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Escaneamentos Recentes</h3>
                  <div className="space-y-2">
                    {recentScans.map((scan, index) => (
                      <div 
                        key={index} 
                        className="p-2 bg-muted rounded-md text-xs flex justify-between"
                      >
                        <span className="font-mono truncate">{scan.code}</span>
                        <span className="text-muted-foreground">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ResponsiveWrapper>
      </div>
    </MainLayout>
  );
};

export default ScanProducts;
