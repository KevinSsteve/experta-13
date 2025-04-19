
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Product } from '@/contexts/CartContext';

export function useProductSearch(products: Product[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const prevProductsLengthRef = useRef<number>(0);
  const scrollListenerActive = useRef<boolean>(true);

  // Reseta o displayCount quando muda a busca ou o array de produtos
  useEffect(() => {
    if (prevProductsLengthRef.current !== products?.length) {
      prevProductsLengthRef.current = products?.length || 0;
      setDisplayCount(20);
    }
  }, [products?.length]);

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    // Verifica se exibe o botão de voltar ao topo
    setShowBackToTop(window.scrollY > 300);
    
    // Só calcula a proximidade do fundo se o listener estiver ativo
    if (scrollListenerActive.current) {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.body.offsetHeight - 500;
      const nearBottom = scrollPosition >= bottomThreshold;
      
      if (nearBottom && !isNearBottom) {
        // Desativa temporariamente o listener para evitar múltiplas cargas
        scrollListenerActive.current = false;
        setIsNearBottom(true);
        
        // Reativa após um curto período
        setTimeout(() => {
          scrollListenerActive.current = true;
        }, 300);
      } else if (!nearBottom && isNearBottom) {
        setIsNearBottom(false);
      }
    }
  }, [isNearBottom]);

  // Handle scroll events with optimized debouncing
  useEffect(() => {
    let timeoutId: number;
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const debouncedScroll = () => {
      if (!ticking) {
        // Usa requestAnimationFrame para otimização
        window.requestAnimationFrame(() => {
          // Só processa a cada 50px de scroll para aumentar performance
          if (Math.abs(window.scrollY - lastScrollY) > 50) {
            handleScroll();
            lastScrollY = window.scrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [handleScroll]);

  // Carrega mais produtos quando estiver perto do fim
  useEffect(() => {
    if (isNearBottom && products && products.length > displayCount) {
      // Implementa um incremento inteligente - adiciona mais itens baseado na largura da tela
      const columnsCount = window.innerWidth < 640 ? 2 : 
                         window.innerWidth < 768 ? 3 : 
                         window.innerWidth < 1024 ? 4 : 6;
                         
      // Incrementa por número de colunas multiplicado por 2 linhas
      setDisplayCount(prevCount => prevCount + (columnsCount * 2));
    }
  }, [isNearBottom, products?.length, displayCount]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    setDisplayCount(20);
    // Volta ao topo quando pesquisar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const searchMultipleProducts = useCallback((productQueries: string[]) => {
    if (productQueries.length === 0) return;
    const combinedQuery = productQueries.join(' ');
    setSearchQuery(combinedQuery);
    setDisplayCount(20);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    if (!searchQuery.trim()) {
      return products;
    }
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return products.filter(product => {
      // Se não há termos de busca, inclui o produto
      if (searchTerms.length === 0) return true;
      
      const productName = product.name.toLowerCase();
      const productCode = product.code?.toLowerCase() || '';
      const productCategory = product.category.toLowerCase();
      
      // Produto deve corresponder a todos os termos de busca
      return searchTerms.every(term => 
        productName.includes(term) || 
        productCode.includes(term) || 
        productCategory.includes(term)
      );
    });
  }, [products, searchQuery]);

  // Memoize visible products calculation - com verificação de segurança
  const visibleProducts = useMemo(() => {
    const filtered = filteredProducts || [];
    const end = Math.min(displayCount, filtered.length);
    return filtered.slice(0, end);
  }, [filteredProducts, displayCount]);

  return {
    searchQuery,
    filteredProducts,
    visibleProducts,
    showBackToTop,
    handleSearch,
    searchMultipleProducts,
    hasMore: filteredProducts.length > visibleProducts.length,
  };
}
