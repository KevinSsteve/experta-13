
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { 
  formatCurrency, 
  debounce, 
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Use React Query to fetch user products
  const { data: userProducts, isLoading, error } = useQuery({
    queryKey: ['userProducts'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      return data as Product[];
    },
    enabled: !!user,
    refetchOnWindowFocus: true, // Refetch when the window gets focus to keep data fresh
  });

  // Handle scroll events for back to top button and infinite loading
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide back to top button
      setShowBackToTop(window.scrollY > 300);
      
      // Check if user is near the bottom of page to trigger loading more
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.body.offsetHeight - 500;
      
      if (scrollPosition >= bottomThreshold) {
        setIsNearBottom(true);
      } else {
        setIsNearBottom(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load more products when user is near bottom
  useEffect(() => {
    if (isNearBottom && filteredProducts.length > displayCount) {
      setDisplayCount(prevCount => prevCount + 8);
    }
  }, [isNearBottom, filteredProducts.length, displayCount]);

  // Update filtered products when userProducts or searchQuery changes
  useEffect(() => {
    if (userProducts) {
      updateFilteredProducts(userProducts);
    }
  }, [userProducts, searchQuery]);

  // Scroll back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Debounced filter function
  const debouncedUpdateProducts = debounce(() => {
    if (userProducts) {
      updateFilteredProducts(userProducts);
    }
  }, 300);

  // Update filtered products based on search query
  const updateFilteredProducts = (products: Product[] = []) => {
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

  console.log("Rendering Index component", {
    userProducts: userProducts?.length || 0,
    filteredProducts: filteredProducts.length,
    visibleProducts: visibleProducts.length,
    user: !!user
  });

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
          
          {/* Products grid */}
          <section>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-card animate-pulse aspect-square rounded-lg"></div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <p>Erro ao carregar produtos: {(error as Error).message}</p>
                <Button onClick={() => window.location.reload()} className="mt-2">
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-2xl font-medium mb-2">Nenhum produto encontrado</p>
                    <p className="text-muted-foreground mb-6">
                      {userProducts && userProducts.length === 0 
                        ? "Você ainda não tem produtos em seu estoque."
                        : "Tente ajustar sua pesquisa para encontrar produtos."
                      }
                    </p>
                    <Link to="/products">
                      <Button>
                        Adicionar produtos ao estoque
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {visibleProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden group h-full flex flex-col">
                          <AspectRatio ratio={1} className="bg-muted relative overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-medium text-xs sm:text-sm px-2 py-1 bg-red-500 rounded-md">
                                  Esgotado
                                </span>
                              </div>
                            )}
                          </AspectRatio>
                          
                          <CardContent className="p-2 flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium line-clamp-1 text-xs sm:text-sm">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-primary">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                            {product.stock > 0 && (
                              <p className="text-xs">Estoque: {product.stock} unidades</p>
                            )}
                          </CardContent>
                          
                          <CardFooter className="p-2 pt-0 mt-auto">
                            <Button 
                              className="w-full text-xs"
                              size="sm"
                              disabled={product.stock === 0}
                              onClick={() => addItem(product)}
                            >
                              <ShoppingCart className="mr-1 h-3 w-3" />
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
