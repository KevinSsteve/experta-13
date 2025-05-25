import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Search, Plus, Database } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logCurrentUser } from "@/utils/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { importProductsToSupabase } from "@/utils/product-importer";
import { ProductsList } from "@/components/products/ProductsList";
import { ProductDialog } from '@/components/inventory/ProductDialog';
import { ProductFormValues } from "@/components/products/ProductForm";

const productsData = `Açucar (200,00 AOA); Açucar (1 200,00 AOA); Açúcar meio kilo (600,00 AOA); Afia lapis (50,00 AOA); Agrafador (2 000,00 AOA); Água e Sal Bolacha (150,00 AOA); Água e Sal Serranitas Arcor (300,00 AOA); Água Tónica Welwitschia (600,00 AOA); Alimo Margarina 200mg (500,00 AOA); Alimo para barrar Margarina (350,00 AOA)`;

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("store");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportButton, setShowImportButton] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: userProductsData, isLoading: isLoadingUserProducts, error: userProductsError, refetch: refetchUserProducts } = useQuery({
    queryKey: ['userProducts'],
    queryFn: async () => {
      console.log("Fetching user products...");
      await logCurrentUser();
      
      if (!user) {
        console.error("No user found when trying to fetch products");
        throw new Error("You must be logged in to view products");
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) {
        console.error("Error fetching user products:", error);
        throw error;
      }
      
      console.log("User products fetched:", data);
      return data as Product[];
    },
    enabled: !!user,
  });

  const { data: publicProductsData, isLoading: isLoadingPublicProducts, error: publicProductsError } = useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => {
      console.log("Fetching all products for store...");
      
      // Buscar todos os produtos disponíveis (não apenas públicos)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching store products:", error);
        throw error;
      }
      
      // Garantir que todos os produtos tenham purchase_price
      const productsWithPurchasePrice = (data || []).map(product => ({
        ...product,
        purchase_price: product.purchase_price || product.price * 0.7,
      })) as Product[];
      
      console.log("Store products fetched:", productsWithPurchasePrice);
      return productsWithPurchasePrice;
    }
  });

  useEffect(() => {
    if (user?.email === "admin@example.com" || user?.email === "demo@example.com") {
      setShowImportButton(true);
    }
  }, [user]);

  const filteredProducts = (activeTab === "store" ? publicProductsData || [] : userProductsData || []).filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToStock = async (product: Product) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos ao estoque");
      return;
    }

    const existingProduct = userProductsData?.find(p => 
      p.name === product.name && 
      p.category === product.category
    );

    if (existingProduct) {
      toast.error("Este produto já existe no seu estoque");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        stock: 10,
        description: product.description || '',
        code: product.code || '',
        image: product.image || "/placeholder.svg",
        user_id: user.id,
        is_public: false
      };

      console.log("Adding product to stock:", newProduct);

      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) {
        console.error("Error details when adding to stock:", error);
        throw error;
      }

      console.log("Product added to stock successfully:", insertedProduct);
      toast.success("Produto adicionado ao seu estoque com sucesso!");
      
      refetchUserProducts();
      
      setActiveTab("my-products");
    } catch (error: any) {
      console.error("Detailed error adding product to stock:", error);
      toast.error(`Erro ao adicionar produto ao estoque: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (data: ProductFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Adding product with user_id:", user.id);
      console.log("Product data:", {
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
        description: data.description || null,
        code: data.code || null,
        image: data.image || "/placeholder.svg",
        user_id: user.id
      });

      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description || null,
          code: data.code || null,
          image: data.image || "/placeholder.svg",
          user_id: user.id
        }])
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Product added successfully:", insertedProduct);
      toast.success("Produto adicionado com sucesso!");
      refetchUserProducts();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error("Detailed error adding product:", error);
      toast.error(`Erro ao adicionar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: ProductFormValues) => {
    if (!editingProduct || !user) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description || null,
          code: data.code || null,
          image: data.image || "/placeholder.svg",
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success("Produto atualizado com sucesso!");
      refetchUserProducts();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
      console.error("Erro ao atualizar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Produto excluído com sucesso!");
      refetchUserProducts();
    } catch (error: any) {
      toast.error(`Erro ao excluir produto: ${error.message}`);
      console.error("Erro ao excluir produto:", error);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleImportProducts = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para importar produtos");
      return;
    }
    
    try {
      setIsImporting(true);
      await importProductsToSupabase(productsData);
      toast.success("Produtos importados com sucesso!");
      
      refetchUserProducts();
      setShowImportButton(false);
    } catch (error: any) {
      console.error("Error importing products:", error);
      toast.error(`Erro ao importar produtos: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoadingUserProducts && activeTab === "my-products") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando produtos...</p>
        </div>
      </MainLayout>
    );
  }

  if (userProductsError && activeTab === "my-products") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar produtos: {(userProductsError as Error).message}</p>
            <Button onClick={() => refetchUserProducts()} className="mt-2">Tentar novamente</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoadingPublicProducts && activeTab === "store") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando produtos da loja...</p>
        </div>
      </MainLayout>
    );
  }

  if (publicProductsError && activeTab === "store") {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar produtos da loja: {(publicProductsError as Error).message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col space-y-4">
          {/* Header and action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Produtos</h1>
              <p className="text-sm text-muted-foreground">Adicione ou gerencie produtos no seu estoque</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {showImportButton && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={handleImportProducts}
                  disabled={isImporting}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isImporting ? "Importando..." : "Importar Produtos"}
                </Button>
              )}
              
              <Button 
                className="w-full sm:w-auto" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {!isMobile ? "Adicionar Produto" : "Adicionar"}
              </Button>
            </div>
          </div>

          {/* Main content card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-3 w-full grid grid-cols-2 h-auto">
                  <TabsTrigger value="store" className="py-1.5 text-xs sm:text-sm">Loja de Produtos</TabsTrigger>
                  <TabsTrigger value="my-products" className="py-1.5 text-xs sm:text-sm">Meus Produtos</TabsTrigger>
                </TabsList>

                <CardTitle className="text-lg sm:text-xl">
                  {activeTab === "store" ? "Loja de Produtos" : "Meus Produtos"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {activeTab === "store" 
                    ? "Adicione produtos da loja ao seu estoque." 
                    : "Gerencie os produtos disponíveis no seu estoque."}
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou categoria..."
                    className="pl-10 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0 sm:p-3">
              <ScrollArea className="h-[calc(100vh-280px)] sm:h-[60vh] w-full">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="store" className="mt-0 px-2 sm:px-0">
                    <ProductsList 
                      products={filteredProducts}
                      isStore={true}
                      onAdd={addToStock}
                      isSubmitting={isSubmitting}
                    />
                  </TabsContent>
                  
                  <TabsContent value="my-products" className="mt-0 px-2 sm:px-0">
                    <ProductsList 
                      products={filteredProducts}
                      isStore={false}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteProduct}
                    />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Product Dialog */}
      <ProductDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        product={null}
        onSubmit={handleAddProduct}
        isSubmitting={isSubmitting}
        mode="add"
      />

      {/* Edit Product Dialog */}
      <ProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        onSubmit={handleEditProduct}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </MainLayout>
  );
};

export default Products;
