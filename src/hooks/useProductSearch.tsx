
import { useState, useEffect } from 'react';
import { Product } from '@/contexts/CartContext';
import { debounce, filterProducts, productMatchesQuery } from '@/lib/utils';

export function useProductSearch(products: Product[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  // Lista de buscas pendentes para processamento sequencial
  const [pendingSearches, setPendingSearches] = useState<string[]>([]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide back to top button
      setShowBackToTop(window.scrollY > 300);
      
      // Check if user is near the bottom of page
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.body.offsetHeight - 500;
      setIsNearBottom(scrollPosition >= bottomThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load more products when user is near bottom
  useEffect(() => {
    if (isNearBottom && filteredProducts.length > displayCount) {
      setDisplayCount(prevCount => prevCount + 8);
    }
  }, [isNearBottom, filteredProducts.length, displayCount]);

  // Update filtered products when source products or searchQuery changes
  useEffect(() => {
    if (products) {
      updateFilteredProducts(products);
    }
  }, [products, searchQuery]);

  // Processar próxima busca pendente quando houver
  useEffect(() => {
    if (pendingSearches.length > 0) {
      // Pequena pausa entre pesquisas sequenciais para permitir que a UI atualize
      const timeoutId = setTimeout(() => {
        const nextSearch = pendingSearches[0];
        setSearchQuery(nextSearch);
        setPendingSearches(prev => prev.slice(1));
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pendingSearches]);

  // Função para filtrar produtos baseado na query atual
  const updateFilteredProducts = (productsToFilter: Product[] = []) => {
    if (!productsToFilter) return;
    
    const filtered = filterProducts(productsToFilter, searchQuery);
    console.log(`Filtrando produtos com a query "${searchQuery}"`, filtered.length, "resultados encontrados");
    setFilteredProducts(filtered);
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    console.log(`Atualizando busca para: "${newSearchQuery}"`);
    setSearchQuery(newSearchQuery);
    // O efeito vai cuidar da filtragem
  };

  // Função para pesquisar múltiplos produtos em sequência
  const searchMultipleProducts = (productQueries: string[]) => {
    console.log(`Recebendo múltipla busca: ${productQueries.join(', ')}`);
    
    if (productQueries.length === 0) return;
    
    // Se for apenas um produto, definimos diretamente
    if (productQueries.length === 1) {
      setSearchQuery(productQueries[0]);
      return;
    }
    
    // Para múltiplos produtos, criamos uma query combinada
    // usando espaços para permitir correspondência parcial
    const combinedQuery = productQueries.join(' ');
    console.log(`Criando busca combinada: "${combinedQuery}"`);
    setSearchQuery(combinedQuery);
    
    // Limpamos as buscas pendentes para evitar sobreposição
    setPendingSearches([]);
  };

  // Visible products based on current display count
  const visibleProducts = filteredProducts.slice(0, displayCount);

  return {
    searchQuery,
    filteredProducts,
    visibleProducts,
    showBackToTop,
    handleSearch,
    searchMultipleProducts,
    pendingSearches,
  };
}
