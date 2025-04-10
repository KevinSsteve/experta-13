
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
  const imageUrl = getProductImageUrl(product.image);
  const hasImage = imageUrl && imageUrl !== "/placeholder.svg";

  return (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Imagem do produto */}
          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center shrink-0">
            {hasImage ? (
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Se a imagem falhar, mostrar ícone de imagem em vez disso
                  e.currentTarget.style.display = 'none';
                  const parentElement = e.currentTarget.parentElement;
                  if (parentElement) {
                    const iconElement = document.createElement('div');
                    iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                    parentElement.appendChild(iconElement);
                  }
                }}
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
