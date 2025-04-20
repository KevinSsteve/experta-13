
import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { Product } from '@/contexts/CartContext';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ProductGridProps {
  products: Product[];
  visibleProducts: Product[];
  isLoading: boolean;
  error: Error | null;
  onAddToCart: (product: Product) => void;
}

export const ProductGrid = memo(({ 
  products, 
  visibleProducts, 
  isLoading, 
  error, 
  onAddToCart 
}: ProductGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2); // Default para mobile
  
  // Função para verificar e atualizar o número de colunas com base na largura da tela
  const updateColumnCount = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    let newColumnCount = 2; // Default para telas pequenas
    
    if (containerWidth >= 1280) {
      newColumnCount = 6; // lg: grid-cols-6
    } else if (containerWidth >= 768) {
      newColumnCount = 4; // md: grid-cols-4
    } else if (containerWidth >= 640) {
      newColumnCount = 3; // sm: grid-cols-3
    }
    
    setColumns(newColumnCount);
  }, []);
  
  // Atualizar colunas quando o componente montar e quando a janela for redimensionada
  useEffect(() => {
    updateColumnCount();
    
    const handleResize = () => {
      updateColumnCount();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateColumnCount]);
  
  // Fallbacks de estado
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="bg-card animate-pulse aspect-square rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>Erro ao carregar produtos: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-medium mb-2">Nenhum produto encontrado</p>
        <p className="text-muted-foreground mb-6">
          Você ainda não tem produtos em seu estoque.
        </p>
      </div>
    );
  }

  if (products.length > 0 && visibleProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-medium mb-2">Nenhum produto encontrado</p>
        <p className="text-muted-foreground mb-6">
          Tente ajustar sua pesquisa para encontrar produtos.
        </p>
      </div>
    );
  }
  
  // Calcular as linhas para a virtualização
  const rows = Math.ceil(visibleProducts.length / columns);
  
  // Renderização padrão quando temos produtos para mostrar
  return (
    <div 
      ref={containerRef} 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full"
    >
      {visibleProducts.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
          priority={index < 12} // Prioriza o carregamento das primeiras 12 imagens
        />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
