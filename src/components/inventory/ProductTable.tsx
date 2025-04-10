
import { Product } from '@/lib/products/types';
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductCardList } from './ProductCardList';
import { ProductTableDesktop } from './ProductTableDesktop';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  const isMobile = useIsMobile();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto encontrado nesta categoria
      </div>
    );
  }

  return isMobile ? (
    // Mobile view - using cards with flexbox layout
    <ProductCardList products={products} onEdit={onEdit} onDelete={onDelete} />
  ) : (
    // Desktop view - using responsive table with flexbox container
    <ProductTableDesktop products={products} onEdit={onEdit} onDelete={onDelete} />
  );
};
