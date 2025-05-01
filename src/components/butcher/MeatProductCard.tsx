
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Beef, Tag, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MeatCut, animalTypeLabels } from '@/lib/butcher/types';

interface MeatProductCardProps {
  product: MeatCut;
  onAddToCart?: (product: MeatCut) => void;
  onEdit?: (product: MeatCut) => void;
}

export const MeatProductCard = ({ product, onAddToCart, onEdit }: MeatProductCardProps) => {
  const isLowStock = product.stock_weight > 0 && product.stock_weight < 5;
  const isOutOfStock = product.stock_weight <= 0;
  
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
            <h3 className="font-medium text-lg">{product.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Beef className="h-3 w-3 mr-1" />
              <span>{animalTypeLabels[product.animal_type] || product.animal_type}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(product.price_per_kg)}</div>
            <div className="text-sm text-muted-foreground">por Kg</div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"} className="flex items-center gap-1">
            {isOutOfStock || isLowStock ? <AlertTriangle className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            {isOutOfStock ? "Sem estoque" : 
             isLowStock ? `Baixo estoque: ${product.stock_weight.toFixed(2)} Kg` : 
             `${product.stock_weight.toFixed(2)} Kg em estoque`}
          </Badge>
        </div>
        
        {product.description && (
          <p className="mt-3 text-sm line-clamp-2">{product.description}</p>
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
