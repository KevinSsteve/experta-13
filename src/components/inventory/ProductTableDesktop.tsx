
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/products/types';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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

interface ProductTableDesktopProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTableDesktop = ({ products, onEdit, onDelete }: ProductTableDesktopProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto encontrado nesta categoria
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border">
      <div className="overflow-x-auto -mx-1 px-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="max-w-[100px] truncate">{product.code || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.image && (
                      <div className="h-10 w-10 flex-shrink-0 bg-muted rounded overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[120px] truncate">{product.category}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-1">
                      <StockStatusIndicator stock={product.stock} />
                      <span className="text-sm whitespace-nowrap">
                        {product.stock} unidades
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <ProductQRCode product={product} />
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="pt-4">
                          <p className="mb-2">
                            <span className="font-medium">{product.name}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Código: {product.code || "Sem código"} • {product.category}
                          </p>
                        </div>
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(product.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
