import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/products/types';
import { Edit, Trash2 } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
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

  return (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
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
