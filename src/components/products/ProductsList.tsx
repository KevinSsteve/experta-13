
import React from 'react';
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash, PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ProductsListProps {
  products: Product[];
  isStore?: boolean;
  onAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export const ProductsList = ({
  products,
  isStore = false,
  onAdd,
  onEdit,
  onDelete,
  isSubmitting = false,
}: ProductsListProps) => {
  const isMobile = useIsMobile();

  if (products.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        {isStore
          ? "Nenhum produto disponível na loja."
          : "Nenhum produto no seu estoque. Adicione produtos da loja ou crie um novo produto."}
      </div>
    );
  }

  // Versão móvel (cards)
  if (isMobile) {
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
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-7 w-7 p-0">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o produto "{product.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete && onDelete(product.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Versão desktop (tabela)
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Nome</TableHead>
            <TableHead className="w-[15%]">Código</TableHead>
            <TableHead className="w-[15%]">Categoria</TableHead>
            <TableHead className="w-[10%]">Preço</TableHead>
            {!isStore && <TableHead className="w-[10%]">Estoque</TableHead>}
            <TableHead className="w-[10%] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.code || "-"}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              {!isStore && (
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : product.stock < 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock} un
                  </span>
                </TableCell>
              )}
              <TableCell className="text-right">
                {isStore ? (
                  <Button 
                    onClick={() => onAdd && onAdd(product)}
                    disabled={isSubmitting}
                    size="sm"
                    variant="secondary"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit && onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{product.name}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete && onDelete(product.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
