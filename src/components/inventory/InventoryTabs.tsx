
import { Product } from '@/contexts/CartContext';
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
    <Card>
      <CardHeader className="pb-0 px-2 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            <TabsTrigger value="low" className="text-xs sm:text-sm">
              Baixo Estoque
            </TabsTrigger>
            <TabsTrigger value="out" className="text-xs sm:text-sm">
              Sem Estoque
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <ProductTable 
          products={getCurrentProducts()}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};
