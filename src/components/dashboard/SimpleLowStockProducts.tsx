
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface SimpleLowStockProductsProps {
  products: any[] | undefined;
  isLoading: boolean;
}

export const SimpleLowStockProducts = ({ products, isLoading }: SimpleLowStockProductsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Produtos com Baixo Estoque</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Produtos com Baixo Estoque</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(product.price)}
                  </p>
                  <p className={`text-xs ${
                    product.stock < 5 ? "text-red-500" : "text-amber-500"
                  }`}>
                    Restam {product.stock} unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum produto com baixo estoque encontrado
          </p>
        )}
      </CardContent>
    </Card>
  );
};
