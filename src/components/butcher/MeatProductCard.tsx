
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Beef, Tag, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MeatProduct {
  id: string;
  name: string;
  code?: string;
  animalType: string;
  cutType: string;
  pricePerKg: number;
  stock: number;
  expirationDate?: Date;
  description?: string;
  supplier?: string;
}

const animalTypeLabels: Record<string, string> = {
  'beef': 'Bovino',
  'pork': 'Suíno',
  'lamb': 'Cordeiro/Carneiro',
  'chicken': 'Frango',
  'goat': 'Caprino',
  'game': 'Caça'
};

interface MeatProductCardProps {
  product: MeatProduct;
  onAddToCart?: (product: MeatProduct) => void;
  onEdit?: (product: MeatProduct) => void;
}

export const MeatProductCard = ({ product, onAddToCart, onEdit }: MeatProductCardProps) => {
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock <= 0;
  
  const daysUntilExpiration = product.expirationDate ? 
    Math.ceil((new Date(product.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3 && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  return (
    <Card className="overflow-hidden">
      <div className={cn(
        "h-2",
        isExpired ? "bg-red-500" : 
        isExpiringSoon ? "bg-amber-500" : 
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
              <span>{animalTypeLabels[product.animalType] || product.animalType}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(product.pricePerKg)}</div>
            <div className="text-sm text-muted-foreground">por Kg</div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {product.expirationDate && (
            <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "outline" : "secondary"} className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isExpired ? "Expirado" : 
               isExpiringSoon ? `Expira em ${daysUntilExpiration} dias` : 
               `Validade: ${formatDate(product.expirationDate)}`}
            </Badge>
          )}
          
          <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "secondary"} className="flex items-center gap-1">
            {isOutOfStock || isLowStock ? <AlertTriangle className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            {isOutOfStock ? "Sem estoque" : 
             isLowStock ? `Baixo estoque: ${product.stock.toFixed(2)} Kg` : 
             `${product.stock.toFixed(2)} Kg em estoque`}
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
            disabled={isOutOfStock || isExpired}
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
