
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getProductImageUrl } from '@/integrations/supabase/client';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const imageUrl = getProductImageUrl(product.image);
  const hasImage = imageUrl && imageUrl !== "/placeholder.svg";

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <AspectRatio ratio={1} className="bg-muted relative overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const iconElement = document.createElement('div');
                iconElement.className = "h-full w-full flex items-center justify-center bg-muted";
                iconElement.innerHTML = '<svg class="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                parent.appendChild(iconElement);
              }
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
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
