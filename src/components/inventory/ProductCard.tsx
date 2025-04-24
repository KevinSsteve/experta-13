
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/products/types';
import { Edit, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { InlineEdit } from '@/components/ui/inline-edit';
import { toast } from 'sonner';
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
import { ProductQRCode } from './ProductQRCode';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const handleUpdateStock = async (newValue: string) => {
    const stock = parseInt(newValue, 10);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock })
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast.success('Estoque atualizado com sucesso');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  const handleUpdatePrice = async (newValue: string) => {
    const price = parseFloat(newValue);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ price })
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast.success('Preço atualizado com sucesso');
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Erro ao atualizar preço');
    }
  };

  return (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center shrink-0">
            {product.image && product.image !== "/placeholder.svg" ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-full w-full object-cover"
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
            
            <div className="mt-2 flex items-center justify-between">
              <InlineEdit
                value={product.price}
                onSave={handleUpdatePrice}
                type="number"
                min={0}
                step={0.01}
                formatter={formatCurrency}
                className="text-base font-medium"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="inline-flex items-center gap-2">
            <StockStatusIndicator stock={product.stock} />
            <InlineEdit
              value={product.stock}
              onSave={handleUpdateStock}
              type="number"
              min={0}
              step={1}
              className="w-16"
            />
            <span className="text-sm">un</span>
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
