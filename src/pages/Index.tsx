
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from '@/components/products/SearchBar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { BackToTopButton } from '@/components/ui/back-to-top';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteProducts(user?.id, searchQuery);

  const allProducts = data?.pages.flatMap(page => page.products) ?? [];

  const { 
    visibleProducts, 
    showBackToTop,
    handleSearch,
    searchMultipleProducts
  } = useProductSearch(allProducts);

  // Configurar o observador de interseção para o scroll infinito
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: '200px',
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Search section */}
          <section className="mt-4 mb-6">
            <SearchBar 
              value={searchQuery} 
              onChange={handleSearchChange}
              onMultiSearch={searchMultipleProducts}
            />
          </section>
          
          {/* Products grid */}
          <section>
            <ProductGrid
              products={allProducts}
              visibleProducts={visibleProducts}
              isLoading={isLoading}
              error={error as Error}
              onAddToCart={addItem}
            />
            
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            )}
            
            {/* Intersection observer target */}
            <div ref={loadMoreRef} className="h-4" />
          </section>
        </div>
      </div>
      
      {/* Back to top button */}
      <BackToTopButton visible={showBackToTop} />
    </MainLayout>
  );
};

export default Index;
