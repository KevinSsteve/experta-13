
import { useState, useEffect } from 'react';
import { Product } from '@/contexts/CartContext';
import { debounce, filterProducts } from '@/lib/utils';

export function useProductSearch(products: Product[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  // Adicionado para rastrear produtos para busca em lote
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
      const nextSearch = pendingSearches[0];
      setSearchQuery(nextSearch);
      setPendingSearches(prev => prev.slice(1));
    }
  }, [pendingSearches]);

  // Debounced filter function
  const debouncedUpdateProducts = debounce(() => {
    if (products) {
      updateFilteredProducts(products);
    }
  }, 300);

  // Update filtered products based on search query
  const updateFilteredProducts = (productsToFilter: Product[] = []) => {
    const filtered = filterProducts(productsToFilter, searchQuery);
    setFilteredProducts(filtered);
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedUpdateProducts();
  };

  // Adiciona função para pesquisar múltiplos produtos em sequência
  const searchMultipleProducts = (productQueries: string[]) => {
    if (productQueries.length > 0) {
      // Define o primeiro como busca atual
      setSearchQuery(productQueries[0]);
      
      // Guarda os demais para processamento sequencial
      if (productQueries.length > 1) {
        setPendingSearches(productQueries.slice(1));
      }
      
      debouncedUpdateProducts();
    }
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
