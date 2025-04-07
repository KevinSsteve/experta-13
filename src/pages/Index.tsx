
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { 
  formatCurrency, 
  debounce, 
  getProductsFromStorage, 
  filterProducts, 
  getCategoriesFromProducts 
} from '@/lib/utils';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Slider
} from '@/components/ui/slider';
import { Search, ShoppingCart, ArrowUpCircle } from 'lucide-react';
import { Product } from '@/contexts/CartContext';

const Index = () => {
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [inStock, setInStock] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll events for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
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
  
  // Load data on component mount
  useEffect(() => {
    const products = getProductsFromStorage();
    setCategories(getCategoriesFromProducts(products));
    updateFilteredProducts();
    setIsLoading(false);
    
    // Determine max price for range slider
    const highestPrice = products.length > 0 
      ? Math.max(...products.map(p => p.price)) 
      : 100;
    
    setMaxPrice(Math.ceil(highestPrice / 10) * 10); // Round up to nearest 10
    setPriceRange([0, Math.ceil(highestPrice / 10) * 10]);
  }, []);

  // Debounced filter function
  const debouncedUpdateProducts = debounce(() => {
    updateFilteredProducts();
  }, 300);

  // Update filtered products based on filters
  const updateFilteredProducts = () => {
    const products = getProductsFromStorage();
    
    const filtered = filterProducts(
      products,
      searchQuery,
      category,
      priceRange[0],
      priceRange[1],
      inStock
    );
    
    setFilteredProducts(filtered);
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedUpdateProducts();
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilteredProducts();
  };

  // Handle price range
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    debouncedUpdateProducts();
  };

  // Toggle in-stock filter
  const toggleStockFilter = () => {
    setInStock(!inStock);
    updateFilteredProducts();
  };
  
  // Load more products
  const loadMore = () => {
    setDisplayCount(prevCount => prevCount + 12);
  };
  
  // Visible products based on current display count
  const visibleProducts = filteredProducts.slice(0, displayCount);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Hero section */}
          <section className="py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Bem-vindo à Moloja</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie suas vendas e estoque com eficiência. Pesquise produtos, adicione ao carrinho e finalize vendas rapidamente.
            </p>
          </section>
          
          {/* Search and filter section */}
          <section className="bg-card rounded-lg p-4 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar produtos por nome ou código..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button 
                  variant={inStock ? "default" : "outline"} 
                  className="w-full"
                  onClick={toggleStockFilter}
                >
                  {inStock ? "Mostrando em estoque" : "Mostrar todos"}
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Faixa de preço</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  </span>
                </div>
                
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                />
              </div>
            </div>
          </section>
          
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
                        : "Tente ajustar seus filtros para encontrar produtos."
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-medium mb-4">{filteredProducts.length} produtos encontrados</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visibleProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden group">
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
                          
                          <CardContent className="p-4">
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
                          
                          <CardFooter className="p-4 pt-0">
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
                    
                    {displayCount < filteredProducts.length && (
                      <div className="mt-8 text-center">
                        <Button variant="outline" onClick={loadMore}>
                          Carregar mais produtos
                        </Button>
                      </div>
                    )}
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
