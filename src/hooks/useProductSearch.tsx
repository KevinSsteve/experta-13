
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/contexts/CartContext';

export function useProductSearch(products: Product[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 300);
    const scrollPosition = window.innerHeight + window.scrollY;
    const bottomThreshold = document.body.offsetHeight - 500;
    setIsNearBottom(scrollPosition >= bottomThreshold);
  }, []);

  // Handle scroll events with debouncing
  useEffect(() => {
    let timeoutId: number;
    
    const debouncedScroll = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedScroll);
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isNearBottom && products && products.length > displayCount) {
      setDisplayCount(prevCount => prevCount + 8);
    }
  }, [isNearBottom, products?.length, displayCount]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    setDisplayCount(20);
  }, []);

  const searchMultipleProducts = useCallback((productQueries: string[]) => {
    if (productQueries.length === 0) return;
    const combinedQuery = productQueries.join(' ');
    setSearchQuery(combinedQuery);
    setDisplayCount(20);
  }, []);

  // Memoize visible products calculation
  const visibleProducts = useMemo(() => {
    return products?.slice(0, displayCount) ?? [];
  }, [products, displayCount]);

  return {
    searchQuery,
    filteredProducts: products ?? [],
    visibleProducts,
    showBackToTop,
    handleSearch,
    searchMultipleProducts,
  };
}
