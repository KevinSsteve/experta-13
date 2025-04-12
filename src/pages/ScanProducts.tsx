
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { QRScanner } from '@/components/scanner/QRScanner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Scan, ArrowLeft, Search, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/products/queries';

const ScanProducts = () => {
  const [recentScans, setRecentScans] = useState<{ code: string; timestamp: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Função para buscar todos os produtos disponíveis para debug
  const fetchAllProductsForDebug = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, code')
        .limit(10);
      
      if (error) {
        console.error("Erro ao buscar produtos para debug:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar produtos para debug:", error);
      return null;
    }
  };

  const searchProduct = async (productCode: string) => {
    if (!productCode) return;
    
    setIsLoading(true);
    try {
      console.log("Código de produto a ser buscado:", productCode);
      
      // Normalizar o código do produto (remover espaços, converter para minúsculas)
      const normalizedCode = productCode.trim().toLowerCase();
      
      // Adicionar a lista de scans recentes
      setRecentScans(prev => {
        const newScans = [{ code: normalizedCode, timestamp: Date.now() }, ...prev];
        return newScans.slice(0, 5); // Manter apenas os 5 mais recentes
      });
      
      // Log para debug: verificar se o usuário está autenticado
      console.log("Status de autenticação:", user ? "Autenticado" : "Não autenticado");
      
      // Primeiro, buscar diretamente pelo código sem normalização
      let { data: exactMatchRaw, error: exactErrorRaw } = await supabase
        .from('products')
        .select('*')
        .eq('code', productCode);
        
      if (exactErrorRaw) {
        console.error("Erro na busca exata (sem normalização):", exactErrorRaw);
      }
      
      // Busca exata com código normalizado
      let { data: exactMatch, error: exactError } = await supabase
        .from('products')
        .select('*')
        .eq('code', normalizedCode);
        
      if (exactError) {
        console.error("Erro na busca exata (normalizada):", exactError);
      }
      
      // Log para debug: verificar o resultado das buscas exatas
      console.log("Resultado da busca exata sem normalização:", exactMatchRaw);
      console.log("Resultado da busca exata normalizada:", exactMatch);
      
      if ((exactMatchRaw && exactMatchRaw.length > 0) || (exactMatch && exactMatch.length > 0)) {
        // Produto encontrado com correspondência exata
        const foundProduct = exactMatchRaw?.[0] || exactMatch?.[0];
        console.log("Produto encontrado com correspondência exata:", foundProduct);
        addItem(foundProduct);
        toast.success(`${foundProduct.name} adicionado ao carrinho`);
        setIsLoading(false);
        return;
      }
      
      // Se não encontrar correspondência exata, tentar busca parcial com ILIKE
      let { data: partialMatch, error: partialError } = await supabase
        .from('products')
        .select('*')
        .or(`code.ilike.%${normalizedCode}%,name.ilike.%${normalizedCode}%`);
        
      if (partialError) {
        console.error("Erro na busca parcial:", partialError);
        toast.error('Erro ao processar o código QR');
        setIsLoading(false);
        return;
      }
      
      // Log para debug: verificar o resultado da busca parcial
      console.log("Resultado da busca parcial:", partialMatch);

      if (partialMatch && partialMatch.length > 0) {
        // Adicionar o primeiro produto correspondente ao carrinho
        console.log("Produto encontrado com correspondência parcial:", partialMatch[0]);
        addItem(partialMatch[0]);
        toast.success(`${partialMatch[0].name} adicionado ao carrinho`);
      } else {
        // Buscar amostra de produtos para debug
        const sampleProducts = await fetchAllProductsForDebug();
        setDebugInfo({
          searchedCode: normalizedCode,
          availableCodes: sampleProducts?.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code
          }))
        });
        
        console.log("Amostra de produtos disponíveis:", sampleProducts);
        console.log("Nenhum produto encontrado com o código:", normalizedCode);
        toast.error('Nenhum produto encontrado correspondente ao código escaneado');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Erro ao processar o código QR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductFound = async (productCode: string) => {
    await searchProduct(productCode);
  };

  const handleManualSearch = async () => {
    if (!manualCode.trim()) {
      toast.error('Digite um código de produto para buscar');
      return;
    }
    await searchProduct(manualCode);
    setManualCode('');
  };

  const goToCheckout = () => {
    navigate('/checkout');
  };

  // Buscar todos os produtos ao carregar o componente para debug
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Usar a função getProducts do lib/products/queries
        const allProducts = await getProducts('', '', 0, Infinity, false, user?.id);
        console.log("Lista completa de produtos disponíveis:", allProducts);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    
    fetchProducts();
  }, [user]);

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
              
              <div className="mt-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Digite o código do produto manualmente" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button 
                    onClick={handleManualSearch} 
                    disabled={isLoading}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
              
              {debugInfo && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Informações de Debug:</p>
                  <p className="text-xs text-yellow-700 mb-1">Código buscado: <code className="bg-yellow-100 px-1 rounded">{debugInfo.searchedCode}</code></p>
                  <p className="text-xs text-yellow-700 mb-1">Códigos disponíveis na base de dados:</p>
                  <div className="max-h-40 overflow-y-auto">
                    {debugInfo.availableCodes?.length > 0 ? (
                      <ul className="text-xs space-y-1 pl-2">
                        {debugInfo.availableCodes.map((p: any, i: number) => (
                          <li key={i} className="text-yellow-700">
                            <code className="bg-yellow-100 px-1 rounded">{p.code || 'null'}</code> - {p.name} (ID: {p.id})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-yellow-700">Nenhum código encontrado na base de dados.</p>
                    )}
                  </div>
                </div>
              )}
              
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
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={async () => {
                    const products = await fetchAllProductsForDebug();
                    setDebugInfo({
                      searchedCode: "Nenhum código buscado ainda",
                      availableCodes: products?.map(p => ({
                        id: p.id,
                        name: p.name,
                        code: p.code
                      }))
                    });
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Mostrar Produtos no Banco de Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </ResponsiveWrapper>
      </div>
    </MainLayout>
  );
};

export default ScanProducts;
