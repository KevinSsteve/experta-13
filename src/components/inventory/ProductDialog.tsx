
import { Product } from '@/contexts/CartContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm, ProductFormValues } from '@/components/products/ProductForm';

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
  mode: 'add' | 'edit';
}

export const ProductDialog = ({
  isOpen,
  onOpenChange,
  product,
  onSubmit,
  isSubmitting,
  mode
}: ProductDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[600px] p-3 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">
            {mode === 'add' ? 'Adicionar Novo Produto' : 'Editar Produto'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'add' 
              ? 'Preencha as informações do produto e clique em salvar.'
              : 'Atualize as informações do produto e clique em salvar.'
            }
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          defaultValues={mode === 'edit' ? product || undefined : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};
