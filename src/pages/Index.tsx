
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
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const Index = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // Número de produtos por página

  // Use React Query to fetch user products
  const { data: userProducts, isLoading, error } = useQuery({
    queryKey: ['userProducts', currentPage],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      // Agora buscamos apenas uma página de produtos de cada vez
      // to reduzir o consumo de dados
      console.log(`Buscando produtos da página ${currentPage}`);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name')
        .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1);
        
      if (error) throw error;
      
      console.log(`Produtos carregados: ${data?.length || 0}`);
      return data as Product[];
    },
    enabled: !!user,
    refetchOnWindowFocus: false, // Evita recarregar os dados ao voltar para a janela
    placeholderData: (previousData) => previousData, // Substitui keepPreviousData que foi removido na versão 5
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

  // Total de páginas - precisamos buscar o total
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Buscar o total de produtos para calcular o total de páginas
  useEffect(() => {
    if (!user) return;

    const fetchTotalProducts = async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Erro ao buscar o total de produtos:", error);
        return;
      }
      
      if (count !== null) {
        setTotalProducts(count);
        setTotalPages(Math.ceil(count / productsPerPage));
        console.log(`Total de produtos: ${count}, Total de páginas: ${Math.ceil(count / productsPerPage)}`);
      }
    };
    
    fetchTotalProducts();
  }, [user]);

  console.log(`Renderizando Index: Página=${currentPage}, Query="${searchQuery}", Filtrados=${filteredProducts?.length || 0}, Visíveis=${visibleProducts?.length || 0}`);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

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
          
          {/* Pagination */}
          {!searchQuery && totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
              >
                Anterior
              </Button>
              
              <span className="flex items-center px-3">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button 
                variant="outline" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Back to top button */}
      <BackToTopButton visible={showBackToTop} />
    </MainLayout>
  );
};

export default Index;
