
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInventory } from '@/hooks/useInventory';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTabs } from '@/components/inventory/InventoryTabs';
import { ProductDialog } from '@/components/inventory/ProductDialog';
import { Card, CardContent } from '@/components/ui/card';

const Inventory = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const inventory = useInventory(user?.id);
  
  if (inventory.isLoadingProducts) {
    return (
      <MainLayout>
        <div className="container mx-auto px-2 py-4 max-w-full">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">Gerenciamento de Estoque</h1>
            </div>
            <div className="h-40 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (inventory.productsError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-2 py-4 max-w-full">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">Gerenciamento de Estoque</h1>
            </div>
            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 mb-4">Erro ao carregar produtos:</p>
                <p className="text-sm text-red-600">{(inventory.productsError as Error).message}</p>
                <Button 
                  onClick={() => inventory.refetchProducts()} 
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-2 pb-6 max-w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Gerenciamento de Estoque</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Controle e atualize o estoque de produtos.</p>
            </div>
            
            <Button 
              className="w-full md:w-auto"
              onClick={() => inventory.setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {!isMobile && "Adicionar Produto"}
              {isMobile && "Novo Produto"}
            </Button>
          </div>

          {/* Inventory stats */}
          <InventoryStats 
            products={inventory.products} 
            lowStockProducts={inventory.lowStockProducts}
            outOfStockProducts={inventory.outOfStockProducts}
          />

          {/* Search and filters */}
          <InventoryFilters 
            searchQuery={inventory.searchQuery}
            onSearch={inventory.handleSearch}
            category={inventory.category}
            onCategoryChange={inventory.handleCategoryChange}
            categories={inventory.categories}
          />

          {/* Inventory tabs and table */}
          <InventoryTabs 
            activeTab={inventory.activeTab}
            setActiveTab={inventory.setActiveTab}
            products={inventory.products}
            lowStockProducts={inventory.lowStockProducts}
            outOfStockProducts={inventory.outOfStockProducts}
            onEdit={inventory.openEditDialog}
            onDelete={inventory.handleDeleteProduct}
          />
        </div>
      </div>

      {/* Dialogs for adding/editing products */}
      <ProductDialog
        isOpen={inventory.isAddDialogOpen}
        onOpenChange={inventory.setIsAddDialogOpen}
        product={null}
        onSubmit={inventory.handleAddProduct}
        isSubmitting={inventory.isSubmitting}
        mode="add"
      />

      <ProductDialog
        isOpen={inventory.isEditDialogOpen}
        onOpenChange={inventory.setIsEditDialogOpen}
        product={inventory.currentProduct}
        onSubmit={inventory.handleEditProduct}
        isSubmitting={inventory.isSubmitting}
        mode="edit"
      />
    </MainLayout>
  );
};

export default Inventory;
