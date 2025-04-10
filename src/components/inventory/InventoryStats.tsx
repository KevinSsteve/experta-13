
import { Product } from '@/contexts/CartContext';
import { Package, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InventoryStatsProps {
  products: Product[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

export const InventoryStats = ({ products, lowStockProducts, outOfStockProducts }: InventoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{products.length}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Baixo Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{lowStockProducts.length}</p>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 sm:col-span-2 md:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sem Estoque</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{outOfStockProducts.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};
