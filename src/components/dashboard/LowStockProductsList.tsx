
import { Product } from '@/lib/products/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface LowStockProductsListProps {
  data: Product[] | undefined;
  isLoading: boolean;
}

export const LowStockProductsList = ({ data, isLoading }: LowStockProductsListProps) => {
  // Helper function to safely render product name
  const renderProductName = (name: any): string => {
    return typeof name === 'string' ? name : 'Produto sem nome';
  };
  
  // Helper function to safely render product category
  const renderProductCategory = (category: any): string => {
    return typeof category === 'string' ? category : 'Sem categoria';
  };
  
  // Helper function to safely render stock info
  const renderStockInfo = (stock: any): string => {
    if (typeof stock === 'number') {
      return `Restam ${stock} unidades`;
    }
    return 'Estoque não disponível';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Produtos com Baixo Estoque</CardTitle>
        <AlertCircle className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{renderProductName(product.name)}</p>
                  <p className="text-sm text-muted-foreground">
                    {renderProductCategory(product.category)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(product.price)}
                  </p>
                  <p className={`text-xs ${
                    product.stock < 5 ? "text-red-500" : "text-amber-500"
                  }`}>
                    {renderStockInfo(product.stock)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum produto com baixo estoque encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
