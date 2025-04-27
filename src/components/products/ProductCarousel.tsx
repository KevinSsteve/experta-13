
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductCarouselProps {
  products: Product[];
  onAdd?: (product: Product) => void;
  isSubmitting?: boolean;
}

export const ProductCarousel = ({ products, onAdd, isSubmitting }: ProductCarouselProps) => {
  if (products.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <Card className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {product.image && product.image !== "/placeholder.svg" ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md">
                      Esgotado
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  {product.stock > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {product.stock} disponíveis
                    </span>
                  )}
                </div>
                <Button 
                  className="w-full"
                  onClick={() => onAdd?.(product)}
                  disabled={isSubmitting || product.stock === 0}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar ao Estoque
                </Button>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="hidden sm:block">
        <CarouselPrevious className="-left-4 sm:-left-6" />
        <CarouselNext className="-right-4 sm:-right-6" />
      </div>
    </Carousel>
  );
};
