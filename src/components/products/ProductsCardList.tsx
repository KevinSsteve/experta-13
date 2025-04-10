
import React from 'react';
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash, PlusCircle } from 'lucide-react';
import { DeleteProductDialog } from './DeleteProductDialog';

interface ProductsCardListProps {
  products: Product[];
  isStore?: boolean;
  onAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export const ProductsCardList = ({
  products,
  isStore = false,
  onAdd,
  onEdit,
  onDelete,
  isSubmitting = false,
}: ProductsCardListProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate text-sm">{product.name}</h3>
                <div className="text-xs text-muted-foreground mb-1 truncate">
                  {product.code || "Sem código"} • {product.category}
                </div>
                <div className="font-medium text-sm">{formatCurrency(product.price)}</div>
                
                {!isStore && (
                  <span
                    className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : product.stock < 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock} un
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                {isStore ? (
                  <Button 
                    onClick={() => onAdd && onAdd(product)}
                    disabled={isSubmitting}
                    size="sm"
                    className="whitespace-nowrap text-xs px-2 py-1 h-auto"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit && onEdit(product)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    
                    <DeleteProductDialog 
                      product={product} 
                      onDelete={() => onDelete && onDelete(product.id)}
                      isMobile
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
