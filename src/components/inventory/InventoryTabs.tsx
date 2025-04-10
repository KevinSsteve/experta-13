
import { Product } from '@/lib/products/types';
import { 
  Card,
  CardHeader,
  CardContent
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductCardList } from '@/components/inventory/ProductCardList';
import { useState } from 'react';
import { LayoutGrid, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  products: Product[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const InventoryTabs = ({ 
  activeTab, 
  setActiveTab, 
  products,
  lowStockProducts,
  outOfStockProducts,
  onEdit, 
  onDelete 
}: InventoryTabsProps) => {
  // Estado para controlar o modo de visualização (tabela ou cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Get current products based on active tab
  const getCurrentProducts = () => {
    switch (activeTab) {
      case 'low':
        return lowStockProducts;
      case 'out':
        return outOfStockProducts;
      case 'all':
      default:
        return products;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 px-2 sm:px-6">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-3">
                Todos
              </TabsTrigger>
              <TabsTrigger value="low" className="text-xs sm:text-sm px-1 sm:px-3">
                Baixo Estoque
              </TabsTrigger>
              <TabsTrigger value="out" className="text-xs sm:text-sm px-1 sm:px-3">
                Sem Estoque
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-1 ml-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="h-8 w-8"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('cards')}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {viewMode === 'table' ? (
          <ProductTable 
            products={getCurrentProducts()}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <ProductCardList
            products={getCurrentProducts()}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};
