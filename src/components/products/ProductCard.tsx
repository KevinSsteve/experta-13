
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <AspectRatio ratio={1} className="bg-muted relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium text-xs sm:text-sm px-2 py-1 bg-red-500 rounded-md">
              Esgotado
            </span>
          </div>
        )}
      </AspectRatio>
      
      <CardContent className="p-2 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium line-clamp-1 text-xs sm:text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          </div>
          <span className="text-xs sm:text-sm font-medium text-primary">
            {formatCurrency(product.price)}
          </span>
        </div>
        {product.stock > 0 && (
          <p className="text-xs">Estoque: {product.stock} unidades</p>
        )}
      </CardContent>
      
      <CardFooter className="p-2 pt-0 mt-auto">
        <Button 
          className="w-full text-xs"
          size="sm"
          disabled={product.stock === 0}
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart className="mr-1 h-3 w-3" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};
