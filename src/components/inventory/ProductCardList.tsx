
import { Product } from '@/lib/products/types';
import { ProductCard } from './ProductCard';

interface ProductCardListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCardList = ({ products, onEdit, onDelete }: ProductCardListProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto encontrado nesta categoria
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {products.map((product) => (
        <ProductCard 
          key={product.id}
          product={product} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
