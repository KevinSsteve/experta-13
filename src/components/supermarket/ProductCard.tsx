
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Tag, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupermarketProduct, Product, categoryTypeLabels } from '@/lib/supermarket/types';

export interface SupermarketProductCardProps {
  product: SupermarketProduct | Product;
  onAddToCart?: (product: SupermarketProduct | Product) => void;
  onEdit?: (product: SupermarketProduct | Product) => void;
}

export const SupermarketProductCard = ({ product, onAddToCart, onEdit }: SupermarketProductCardProps) => {
  // Converter SupermarketProduct para Product se necessário para acesso consistente às propriedades
  const displayProduct = 'category_type' in product 
    ? {
        ...product,
        category: product.category_type,
        stock: product.stock,
        price: product.price,
        discountPercentage: product.discount_percentage || 0
      } 
    : {
        ...product,
        discountPercentage: product.discount || 0
      };
  
  const isLowStock = displayProduct.stock > 0 && displayProduct.stock < 5;
  const isOutOfStock = displayProduct.stock <= 0;
  const hasDiscount = ('discountPercentage' in displayProduct) && displayProduct.discountPercentage && displayProduct.discountPercentage > 0;
  
  const discountedPrice = hasDiscount 
    ? displayProduct.price - (displayProduct.price * (displayProduct.discountPercentage / 100)) 
    : displayProduct.price;
  
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
              <Package className="h-3 w-3 mr-1" />
              <span>{categoryTypeLabels[displayProduct.category] || displayProduct.category}</span>
            </div>
            {'brand' in product && product.brand && (
              <div className="text-xs text-muted-foreground mt-1">
                {product.brand}
              </div>
            )}
          </div>
          
          <div className="text-right">
            {hasDiscount ? (
              <>
                <div className="line-through text-sm text-muted-foreground">{formatCurrency(displayProduct.price)}</div>
                <div className="font-bold text-lg text-red-600">{formatCurrency(discountedPrice)}</div>
              </>
            ) : (
              <div className="font-bold text-lg">{formatCurrency(displayProduct.price)}</div>
            )}
            {'unit' in product && product.unit && (
              <div className="text-xs text-muted-foreground">
                por {product.unit}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"} className="flex items-center gap-1">
            {isOutOfStock || isLowStock ? <AlertTriangle className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            {isOutOfStock ? "Sem estoque" : 
             isLowStock ? `Baixo estoque: ${displayProduct.stock}` : 
             `${displayProduct.stock} em estoque`}
          </Badge>
          
          {hasDiscount && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              {displayProduct.discountPercentage}% OFF
            </Badge>
          )}
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

export { type SupermarketProduct, type Product };
