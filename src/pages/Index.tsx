
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from '@/components/products/SearchBar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { BackToTopButton } from '@/components/ui/back-to-top';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { searchSimilarProducts } from '@/lib/products/search';
import { toast } from 'sonner';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFindingSimilar, setIsFindingSimilar] = useState(false);

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

  // Função para buscar produtos similares
  const handleFindSimilarProducts = async () => {
    if (!searchQuery.trim()) {
      toast.warning("Digite um termo para buscar produtos similares");
      return;
    }

    setIsFindingSimilar(true);
    try {
      const similarProducts = await searchSimilarProducts(searchQuery.trim(), 10, user?.id);
      
      if (similarProducts.length > 0) {
        toast.success(`Encontrados ${similarProducts.length} produtos similares`);
        searchMultipleProducts(similarProducts.map(p => p.name).join(', '));
      } else {
        toast.info("Não foram encontrados produtos similares");
      }
    } catch (error) {
      console.error('Erro ao buscar produtos similares:', error);
      toast.error("Erro ao buscar produtos similares");
    } finally {
      setIsFindingSimilar(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <section className="mt-4 mb-6">
            <SearchBar 
              value={searchQuery} 
              onChange={handleSearchChange}
              onMultiSearch={searchMultipleProducts}
              onFindSimilar={handleFindSimilarProducts}
              isFindingSimilar={isFindingSimilar}
            />
          </section>
          
          <section>
            <ProductGrid
              products={allProducts}
              visibleProducts={visibleProducts}
              isLoading={isLoading}
              error={error as Error}
              onAddToCart={addItem}
            />
            
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            )}
            
            <div ref={loadMoreRef} className="h-4" />
          </section>
        </div>
      </div>
      
      <BackToTopButton visible={showBackToTop} />
    </MainLayout>
  );
};

export default Index;
