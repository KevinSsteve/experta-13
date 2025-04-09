
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/contexts/CartContext";
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Search, Plus, Database } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, logCurrentUser } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { importProductsToSupabase } from "@/utils/product-importer";
import { ProductsList } from "@/components/products/ProductsList";

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
      console.log("Fetching public products...");
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_public', true)
        .order('name');
      
      if (error) {
        console.error("Error fetching public products:", error);
        throw error;
      }
      
      console.log("Public products fetched:", data);
      return data as Product[];
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
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Produtos</h1>
            
            <div className="flex gap-2">
              {showImportButton && (
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={handleImportProducts}
                  disabled={isImporting}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isImporting ? "Importando..." : "Importar Produtos"}
                </Button>
              )}
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    {!isMobile && "Adicionar Produto"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do produto e clique em salvar.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full sm:w-auto overflow-auto">
                  <TabsTrigger value="store">Loja de Produtos</TabsTrigger>
                  <TabsTrigger value="my-products">Meus Produtos</TabsTrigger>
                </TabsList>

                <CardTitle>
                  {activeTab === "store" ? "Loja de Produtos" : "Meus Produtos"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "store" 
                    ? "Adicione produtos da loja ao seu estoque." 
                    : "Gerencie os produtos disponíveis no seu estoque."}
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou categoria..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="store" className="mt-0">
                    <ProductsList 
                      products={filteredProducts}
                      isStore={true}
                      onAdd={addToStock}
                      isSubmitting={isSubmitting}
                    />
                  </TabsContent>
                  
                  <TabsContent value="my-products" className="mt-0">
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

      {/* Dialog para edição de produtos */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              onSubmit={handleEditProduct}
              defaultValues={editingProduct}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;
