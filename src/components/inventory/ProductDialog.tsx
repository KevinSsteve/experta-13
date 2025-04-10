
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Adicionar Novo Produto' : 'Editar Produto'}
          </DialogTitle>
          <DialogDescription>
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
