
import React from 'react';
import { Product } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProductsTable } from './ProductsTable';
import { ProductsCardList } from './ProductsCardList';
import { EmptyProductsList } from './EmptyProductsList';

interface ProductsListProps {
  products: Product[];
  isStore?: boolean;
  onAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export const ProductsList = ({
  products,
  isStore = false,
  onAdd,
  onEdit,
  onDelete,
  isSubmitting = false,
}: ProductsListProps) => {
  const isMobile = useIsMobile();

  if (products.length === 0) {
    return <EmptyProductsList isStore={isStore} />;
  }

  // Versão móvel (cards)
  if (isMobile) {
    return (
      <ProductsCardList
        products={products}
        isStore={isStore}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Versão desktop (tabela)
  return (
    <ProductsTable
      products={products}
      isStore={isStore}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      isSubmitting={isSubmitting}
    />
  );
};
