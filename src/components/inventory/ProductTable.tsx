
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/contexts/CartContext';
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
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  const isMobile = useIsMobile();
  
  // Renderiza um card de produto para visualização em dispositivos móveis
  const renderProductCard = (product: Product) => (
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
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="inline-flex items-center gap-1">
            <span 
              className={`h-2 w-2 rounded-full ${
                product.stock === 0
                  ? 'bg-red-500'
                  : product.stock < 10
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              }`}
            />
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

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto encontrado nesta categoria
      </div>
    );
  }

  return isMobile ? (
    // Mobile view - using cards with flexbox layout
    <div className="flex flex-col space-y-3">
      {products.map((product) => renderProductCard(product))}
    </div>
  ) : (
    // Desktop view - using responsive table with flexbox container
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
                      <span 
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          product.stock === 0
                            ? 'bg-red-500'
                            : product.stock < 10
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm whitespace-nowrap">
                        {product.stock} unidades
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
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
