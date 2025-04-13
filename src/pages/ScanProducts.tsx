
import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { QRScanner } from '@/components/scanner/QRScanner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Scan, ArrowLeft, Search, Trash2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/products/queries';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';

const ScanProducts = () => {
  const [recentScans, setRecentScans] = useState<{ code: string; timestamp: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { addItem, state, removeItem, getTotalPrice, getTotalItems, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const scannedProductsRef = useRef<Set<string>>(new Set());

  // Inicializar o set com os IDs dos produtos já no carrinho
  useEffect(() => {
    const cartProductIds = new Set(state.items.map(item => item.product.id));
    scannedProductsRef.current = cartProductIds;
  }, []);

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
      
      // Buscar produtos por três estratégias:
      // 1. Buscar pelo código exato
      // 2. Buscar pelo ID
      // 3. Buscar por correspondência parcial
      
      // Estratégia 1: Buscar pelo código exato
      let { data: codeMatch, error: codeError } = await supabase
        .from('products')
        .select('*')
        .eq('code', normalizedCode);
        
      if (codeError) {
        console.error("Erro na busca por código:", codeError);
      }
      
      console.log("Resultado da busca por código:", codeMatch);
      
      // Estratégia 2: Buscar pelo ID (considerando que o código QR pode conter o ID do produto)
      let { data: idMatch, error: idError } = await supabase
        .from('products')
        .select('*')
        .eq('id', normalizedCode);
        
      if (idError) {
        console.error("Erro na busca por ID:", idError);
      }
      
      console.log("Resultado da busca por ID:", idMatch);
      
      // Se encontrou produto por código ou ID, adicionar ao carrinho se ainda não estiver nele
      if ((codeMatch && codeMatch.length > 0) || (idMatch && idMatch.length > 0)) {
        const foundProduct = codeMatch?.[0] || idMatch?.[0];
        console.log("Produto encontrado com correspondência exata:", foundProduct);
        
        // Verificar se este produto já está no carrinho pelo ID
        const existingItem = state.items.find(item => item.product.id === foundProduct.id);
        
        if (existingItem) {
          // Produto já está no carrinho, aumentar a quantidade
          updateQuantity(foundProduct.id, existingItem.quantity + 1);
          toast.success(`Quantidade de ${foundProduct.name} aumentada para ${existingItem.quantity + 1}`);
        } else {
          // Produto novo, adicionar ao carrinho
          addItem(foundProduct);
          // Adicionar ID ao conjunto de produtos escaneados
          scannedProductsRef.current.add(foundProduct.id);
          toast.success(`${foundProduct.name} adicionado ao carrinho`);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Estratégia 3: Busca parcial com ILIKE se as anteriores não funcionaram
      let { data: partialMatch, error: partialError } = await supabase
        .from('products')
        .select('*')
        .or(`code.ilike.%${normalizedCode}%,name.ilike.%${normalizedCode}%`);
        
      if (partialError) {
        console.error("Erro na busca parcial:", partialError);
      }
      
      console.log("Resultado da busca parcial:", partialMatch);

      if (partialMatch && partialMatch.length > 0) {
        // Verificar se este produto já está no carrinho pelo ID
        const existingItem = state.items.find(item => item.product.id === partialMatch[0].id);
        
        if (existingItem) {
          // Produto já está no carrinho, aumentar a quantidade
          updateQuantity(partialMatch[0].id, existingItem.quantity + 1);
          toast.success(`Quantidade de ${partialMatch[0].name} aumentada para ${existingItem.quantity + 1}`);
        } else {
          // Produto novo, adicionar ao carrinho
          console.log("Produto encontrado com correspondência parcial:", partialMatch[0]);
          addItem(partialMatch[0]);
          // Adicionar ID ao conjunto de produtos escaneados
          scannedProductsRef.current.add(partialMatch[0].id);
          toast.success(`${partialMatch[0].name} adicionado ao carrinho`);
        }
      } else {
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
            </CardContent>
          </Card>
          
          {/* Novo Card do Carrinho */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                <span>Carrinho</span>
                {getTotalItems() > 0 && (
                  <span className="ml-auto text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Produtos adicionados ao carrinho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.items.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escaneie produtos para adicioná-los ao carrinho
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{item.quantity} × {formatCurrency(item.product.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {state.items.length > 0 && (
              <>
                <Separator />
                <CardFooter className="flex flex-col pt-4">
                  <div className="w-full flex justify-between items-center mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <Button 
                    onClick={goToCheckout} 
                    className="w-full flex items-center justify-center"
                    size="lg"
                  >
                    Finalizar Compra
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </ResponsiveWrapper>
      </div>
    </MainLayout>
  );
};

export default ScanProducts;
