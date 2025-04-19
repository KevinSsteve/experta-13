
import React, { memo, useEffect, useRef } from 'react';
import { Product } from '@/contexts/CartContext';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';

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
  // Ref para o container da grade para medições
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Renderização condicional para estados de carregamento, erro e vazio
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

  return (
    <div 
      ref={gridRef} 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
    >
      {visibleProducts.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
          priority={index < 6} // Prioriza o carregamento das primeiras 6 imagens
        />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
