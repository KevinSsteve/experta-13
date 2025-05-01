
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Beef, Tag, ShoppingCart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MeatCut, MeatProduct, animalTypeLabels } from '@/lib/butcher/types';

export interface MeatProductCardProps {
  product: MeatProduct | MeatCut;
  onAddToCart?: (product: MeatProduct | MeatCut) => void;
  onEdit?: (product: MeatProduct | MeatCut) => void;
}

export const MeatProductCard = ({ product, onAddToCart, onEdit }: MeatProductCardProps) => {
  // Convert MeatCut to MeatProduct if needed for consistent property access
  const displayProduct = 'animal_type' in product 
    ? {
        ...product,
        animalType: product.animal_type,
        pricePerKg: product.price_per_kg,
        stock: product.stock_weight
      } 
    : product;
  
  const isLowStock = displayProduct.stock > 0 && displayProduct.stock < 5;
  const isOutOfStock = displayProduct.stock <= 0;
  
  return (
    <Card className="overflow-hidden">
      <div className={cn(
        "h-2",
        isOutOfStock ? "bg-gray-500" : 
        isLowStock ? "bg-yellow-500" : 
        "bg-green-500"
      )}></div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg">{displayProduct.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Beef className="h-3 w-3 mr-1" />
              <span>{animalTypeLabels[displayProduct.animalType] || displayProduct.animalType}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(displayProduct.pricePerKg)}</div>
            <div className="text-sm text-muted-foreground">por Kg</div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"} className="flex items-center gap-1">
            {isOutOfStock || isLowStock ? <AlertTriangle className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            {isOutOfStock ? "Sem estoque" : 
             isLowStock ? `Baixo estoque: ${displayProduct.stock.toFixed(2)} Kg` : 
             `${displayProduct.stock.toFixed(2)} Kg em estoque`}
          </Badge>
        </div>
        
        {'description' in displayProduct && displayProduct.description && (
          <p className="mt-3 text-sm line-clamp-2">{displayProduct.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            Editar
          </Button>
        )}
        
        {onAddToCart && (
          <Button 
            size="sm" 
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="ml-auto"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { type MeatCut, type MeatProduct };
