
import React from 'react';
import { Product } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProductDialog } from './DeleteProductDialog';
import { ProductQRCode } from '@/components/inventory/ProductQRCode';

interface ProductsTableProps {
  products: Product[];
  isStore?: boolean;
  onAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export const ProductsTable = ({
  products,
  isStore = false,
  onAdd,
  onEdit,
  onDelete,
  isSubmitting = false,
}: ProductsTableProps) => {
  if (products.length === 0) {
    return null;
  }

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
                    <ProductQRCode 
                      product={{
                        ...product,
                        purchase_price: product.purchase_price || 0,
                      }} 
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit && onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <DeleteProductDialog 
                      product={product} 
                      onDelete={() => onDelete && onDelete(product.id)} 
                    />
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
