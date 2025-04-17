
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';
import { SearchBar } from '@/components/products/SearchBar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { BackToTopButton } from '@/components/ui/back-to-top';
import { useProductSearch } from '@/hooks/useProductSearch';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();

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
      
      console.log(`Produtos carregados: ${data?.length || 0}`);
      return data as Product[];
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  // Use the product search hook
  const { 
    searchQuery, 
    filteredProducts, 
    visibleProducts, 
    showBackToTop, 
    handleSearch,
    searchMultipleProducts
  } = useProductSearch(userProducts);

  console.log(`Renderizando Index: Query="${searchQuery}", Filtrados=${filteredProducts?.length || 0}, Visíveis=${visibleProducts?.length || 0}`);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Search section */}
          <section className="mt-4 mb-6">
            <SearchBar 
              value={searchQuery} 
              onChange={handleSearch}
              onMultiSearch={searchMultipleProducts}
            />
          </section>
          
          {/* Products grid */}
          <section>
            <ProductGrid
              products={filteredProducts}
              visibleProducts={visibleProducts}
              isLoading={isLoading}
              error={error as Error}
              onAddToCart={addItem}
            />
          </section>
        </div>
      </div>
      
      {/* Back to top button */}
      <BackToTopButton visible={showBackToTop} />
    </MainLayout>
  );
};

export default Index;
