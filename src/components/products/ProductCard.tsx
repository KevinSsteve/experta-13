
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getProductImageUrl } from '@/integrations/supabase/client';
import { useEffect, useState, useRef } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg");
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Create a new IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      // If the image is intersecting with the viewport
      if (entries[0].isIntersecting && product.image && !isLoaded) {
        // Get the image URL from the product
        const url = getProductImageUrl(product.image);
        setImageUrl(url);
        setIsLoaded(true);
        console.log(`Loading image for product ${product.name}, image path: ${product.image}`);
        
        // Stop observing once we've loaded the image
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      }
    }, {
      rootMargin: '200px', // Load images when they're within 200px of viewport
      threshold: 0.1
    });
    
    // Start observing the image element
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    // Cleanup function to unobserve when component unmounts
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [product.image, isLoaded]);

  const handleImageError = () => {
    console.error(`Failed to load image for product: ${product.name}, URL: ${imageUrl}`);
    setImageError(true);
  };

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <AspectRatio ratio={1} className="bg-muted relative overflow-hidden">
        <div ref={imgRef} className="h-full w-full">
          {isLoaded && !imageError && imageUrl !== "/placeholder.svg" ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
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
        </div>
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
