
import { useState, useEffect } from 'react';
import { Product } from '@/contexts/CartContext';

export function useProductSearch(products: Product[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.body.offsetHeight - 500;
      setIsNearBottom(scrollPosition >= bottomThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load more products when user is near bottom
  useEffect(() => {
    if (isNearBottom && products && products.length > displayCount) {
      setDisplayCount(prevCount => prevCount + 8);
    }
  }, [isNearBottom, products?.length, displayCount]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    console.log(`Atualizando busca para: "${newSearchQuery}"`);
    setSearchQuery(newSearchQuery);
    setDisplayCount(20); // Reset display count when searching
  };

  const searchMultipleProducts = (productQueries: string[]) => {
    console.log(`Recebendo múltipla busca: ${productQueries.join(', ')}`);
    if (productQueries.length === 0) return;
    
    const combinedQuery = productQueries.join(' ');
    console.log(`Criando busca combinada: "${combinedQuery}"`);
    setSearchQuery(combinedQuery);
    setDisplayCount(20); // Reset display count for new search
  };

  // Visible products based on current display count
  const visibleProducts = products?.slice(0, displayCount) ?? [];

  return {
    searchQuery,
    filteredProducts: products ?? [],
    visibleProducts,
    showBackToTop,
    handleSearch,
    searchMultipleProducts,
  };
}
