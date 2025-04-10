
import React from 'react';
import { Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
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

interface DeleteProductDialogProps {
  product: Product;
  onDelete: () => void;
  isMobile?: boolean;
}

export const DeleteProductDialog = ({ product, onDelete, isMobile = false }: DeleteProductDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant="destructive" 
          className={isMobile ? "h-7 w-7 p-0" : undefined}
        >
          <Trash className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={isMobile ? "max-w-[90vw]" : undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o produto "{product.name}"?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isMobile ? "flex-col sm:flex-row gap-2" : undefined}>
          <AlertDialogCancel className={isMobile ? "mt-0" : undefined}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
