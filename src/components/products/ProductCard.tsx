
import { memo, useState } from 'react';
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  priority?: boolean;
}

const ProductCard = memo(({ product, onAddToCart, priority = false }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Função para otimizar URL da imagem
  const getOptimizedImageUrl = (url: string) => {
    if (!url || url === '/placeholder.svg') return url;
    
    // Adiciona parâmetros de dimensão à URL do Supabase Storage
    if (url.includes('storage.googleapis.com')) {
      return url + '?width=300&height=300&resize=contain';
    }
    return url;
  };

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <AspectRatio ratio={1} className="bg-muted relative overflow-hidden">
        {!imageError && product.image ? (
          <img
            src={getOptimizedImageUrl(product.image)}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            width={150}
            height={150}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {!imageLoaded && !imageError && product.image && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium text-[10px] px-1.5 py-0.5 bg-red-500 rounded">
              Esgotado
            </span>
          </div>
        )}
      </AspectRatio>
      
      <CardContent className="p-1.5 flex-grow">
        <div className="flex justify-between items-start gap-1">
          <div>
            <h3 className="font-medium line-clamp-1 text-[11px]">{product.name}</h3>
            <p className="text-[10px] text-muted-foreground">{product.category}</p>
          </div>
          <span className="text-[11px] font-medium text-primary whitespace-nowrap">
            {formatCurrency(product.price)}
          </span>
        </div>
        {product.stock > 0 && (
          <p className="text-[10px] text-muted-foreground">Estoque: {product.stock}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-1.5 pt-0 mt-auto">
        <Button 
          className="w-full text-[10px]"
          size="sm"
          variant="secondary"
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart className="mr-1 h-3 w-3" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };
