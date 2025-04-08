
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { 
  formatCurrency, 
  debounce, 
  getProductsFromStorage, 
  filterProducts
} from '@/lib/utils';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Search, ShoppingCart, ArrowUpCircle } from 'lucide-react';
import { Product } from '@/contexts/CartContext';
import { supabase, getPublicProducts } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // Handle scroll events for back to top button and infinite loading
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      
      // Verificar se o usuário está próximo ao final da página para carregar mais produtos
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDisplayCount(prevCount => prevCount + 8);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Carregar produtos públicos para sugestões
  useEffect(() => {
    const loadSuggestedProducts = async () => {
      try {
        const publicProducts = await getPublicProducts();
        if (publicProducts && publicProducts.length > 0) {
          setSuggestedProducts(publicProducts);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos sugeridos:", error);
      }
    };

    loadSuggestedProducts();
  }, []);

  // Carregar dados do usuário quando disponíveis
  useEffect(() => {
    const loadUserProducts = async () => {
      setIsLoading(true);
      try {
        // Se o usuário estiver logado, tenta buscar seus produtos
        if (user) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('name');
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            updateFilteredProducts(data);
          } else {
            // Se o usuário não tem produtos, mantém as sugestões
            updateFilteredProducts(suggestedProducts);
          }
        } else {
          // Se não há usuário logado, usa produtos sugeridos
          updateFilteredProducts(suggestedProducts);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos. Usando produtos sugeridos.");
        updateFilteredProducts(suggestedProducts);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProducts();
  }, [user, suggestedProducts]);
  
  // Debounced filter function
  const debouncedUpdateProducts = debounce(() => {
    updateFilteredProducts();
  }, 300);

  // Update filtered products based on search query
  const updateFilteredProducts = (products = filteredProducts) => {
    const filtered = filterProducts(products, searchQuery);
    setFilteredProducts(filtered);
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedUpdateProducts();
  };
  
  // Visible products based on current display count
  const visibleProducts = filteredProducts.slice(0, displayCount);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Search section */}
          <section className="mt-4 mb-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar produtos por nome ou código..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </section>
          
          {/* Suggested products section */}
          {!user && suggestedProducts.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">Produtos Sugeridos</h2>
                <p className="text-sm text-muted-foreground">
                  Faça login para ver seus próprios produtos
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-6">
                  Estes são produtos sugeridos para ajudar você a começar. Faça login para gerenciar seu próprio catálogo.
                </p>
              </div>
            </section>
          )}
          
          {/* Products grid */}
          <section>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-card animate-pulse h-64 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-2xl font-medium mb-2">Nenhum produto encontrado</p>
                    <p className="text-muted-foreground">
                      {getProductsFromStorage().length === 0 
                        ? "Nenhum produto cadastrado. Adicione produtos na página de Produtos."
                        : "Tente ajustar sua pesquisa para encontrar produtos."
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visibleProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden group h-full flex flex-col">
                          <div className="h-48 bg-muted relative overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-medium text-sm px-2 py-1 bg-red-500 rounded-md">
                                  Esgotado
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <CardContent className="p-4 flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                              </div>
                              <span className="text-lg font-medium text-primary">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                            {product.stock > 0 && (
                              <p className="text-xs">Estoque: {product.stock} unidades</p>
                            )}
                          </CardContent>
                          
                          <CardFooter className="p-4 pt-0 mt-auto">
                            <Button 
                              className="w-full"
                              disabled={product.stock === 0}
                              onClick={() => addItem(product)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Adicionar
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      
      {/* Back to top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-20 right-4 md:bottom-4 md:right-4 rounded-full h-10 w-10 p-0 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUpCircle className="h-6 w-6" />
        </Button>
      )}
    </MainLayout>
  );
};

export default Index;
