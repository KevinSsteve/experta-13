
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/products/types';
import { Edit, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StockStatusIndicator } from './StockStatusIndicator';
import { getProductImageUrl } from '@/integrations/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { ProductQRCode } from './ProductQRCode';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg");
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a new IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      // If the image container is intersecting with the viewport
      if (entries[0].isIntersecting && product.image && !isLoaded) {
        // Get the image URL from the product
        const url = getProductImageUrl(product.image);
        setImageUrl(url);
        setIsLoaded(true);
        console.log(`Loading image for inventory product ${product.name}, image path: ${product.image}`);
        
        // Stop observing once we've loaded the image
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      }
    }, {
      rootMargin: '200px', // Load images when they're within 200px of viewport
      threshold: 0.1
    });
    
    // Start observing the image element container
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
    console.error(`Failed to load image for inventory product: ${product.name}, URL: ${imageUrl}`);
    setImageError(true);
  };

  // Calcular a margem de lucro se os preços estiverem disponíveis
  const getProfitInfo = () => {
    const purchasePrice = product.purchase_price;
    const profitMargin = product.profit_margin;
    
    if (profitMargin !== null && profitMargin !== undefined) {
      return `${profitMargin.toFixed(2)}%`;
    } else if (purchasePrice && purchasePrice > 0) {
      const margin = ((product.price - purchasePrice) / purchasePrice) * 100;
      return `${margin.toFixed(2)}%`;
    }
    return null;
  };

  const profitInfo = getProfitInfo();
  const hasImage = !imageError && imageUrl !== "/placeholder.svg" && isLoaded;

  return (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Imagem do produto */}
          <div ref={imgRef} className="h-16 w-16 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center shrink-0">
            {hasImage ? (
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="h-full w-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <Image className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div>
              <h3 className="font-medium text-base truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {product.code || "Sem código"} • {product.category}
              </p>
            </div>
          </div>
          
          <div className="text-right ml-2">
            <div className="font-medium">{formatCurrency(product.price)}</div>
            {profitInfo && (
              <p className="text-xs text-green-600">Margem: {profitInfo}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="inline-flex items-center gap-1">
            <StockStatusIndicator stock={product.stock} />
            <span className="text-sm">
              {product.stock} unidades
            </span>
          </div>
          
          <div className="flex space-x-2">
            <ProductQRCode product={product} />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="pt-2">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Código: {product.code || "Sem código"} • {product.category}
                  </p>
                </div>
                
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                  <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="sm:mt-0"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
