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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/contexts/CartContext";
import { 
  generateId, 
  formatCurrency, 
  getProductsFromStorage, 
  saveProductsToStorage,
  getProductsFromSupabase,
  saveProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  getPublicProductSuggestions,
  toggleProductPublicStatus,
  syncProductsToSupabase,
  isUserLoggedIn
} from "@/lib/utils";
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash, Globe, Globe2, Lock, CloudCog } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSyncingProducts, setSyncingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      if (await isUserLoggedIn()) {
        const supabaseProducts = await getProductsFromSupabase();
        const mappedProducts = supabaseProducts.map(product => ({
          ...product,
          isPublic: product.is_public
        }));
        setProducts(mappedProducts);
        saveProductsToStorage(mappedProducts);
      } else {
        const localProducts = getProductsFromStorage();
        setProducts(localProducts);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      const localProducts = getProductsFromStorage();
      setProducts(localProducts);
    }
  };

  const loadSuggestions = async () => {
    const publicProducts = await getPublicProductSuggestions();
    setSuggestions(publicProducts);
  };

  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    try {
      await syncProductsToSupabase();
      await loadProducts();
      toast.success("Produtos sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar produtos:", error);
      toast.error("Erro ao sincronizar produtos");
    } finally {
      setSyncingProducts(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = async (data: ProductFormValues) => {
    const newProduct: Product = {
      id: generateId(),
      name: data.name,
      price: data.price,
      category: data.category,
      stock: data.stock,
      image: data.image || "/placeholder.svg",
      code: data.code,
      description: data.description,
      isPublic: data.isPublic
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    
    if (await isUserLoggedIn()) {
      await saveProductToSupabase({
        ...newProduct,
        is_public: newProduct.isPublic
      });
    }
    
    setIsAddDialogOpen(false);
    toast.success("Produto adicionado com sucesso!");
  };

  const handleEditProduct = async (data: ProductFormValues) => {
    if (!editingProduct) return;
    
    const updatedProduct = {
      ...editingProduct,
      ...data
    };
    
    const updatedProducts = products.map((product) =>
      product.id === editingProduct.id
        ? updatedProduct
        : product
    );
    
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    
    if (await isUserLoggedIn()) {
      await updateProductInSupabase({
        ...updatedProduct,
        is_public: updatedProduct.isPublic
      });
    }
    
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast.success("Produto atualizado com sucesso!");
  };

  const handleDeleteProduct = async (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    
    if (await isUserLoggedIn()) {
      await deleteProductFromSupabase(id);
    }
    
    toast.success("Produto excluído com sucesso!");
  };

  const handleTogglePublic = async (product: Product, isPublic: boolean) => {
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, isPublic } : p
    );
    setProducts(updatedProducts);
    
    if (await isUserLoggedIn()) {
      const success = await toggleProductPublicStatus(product.id, isPublic);
      if (success) {
        toast.success(
          isPublic 
            ? "Produto disponibilizado como sugestão para outros usuários" 
            : "Produto removido das sugestões"
        );
      } else {
        toast.error("Erro ao atualizar status do produto");
        setProducts(products);
      }
    }
  };

  const handleAddSuggestion = async (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    
    if (await isUserLoggedIn()) {
      await saveProductToSupabase({
        ...newProduct,
        is_public: newProduct.isPublic
      });
    }
    
    toast.success("Sugestão de produto adicionada ao seu catálogo!");
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const renderProductItem = (product: Product, isSuggestion = false) => {
    if (isMobile) {
      return (
        <Card key={product.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {product.code || "Sem código"} • {product.category}
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="font-medium">{formatCurrency(product.price)}</div>
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
                </div>
              </div>
              <div className="flex gap-2">
                {!isSuggestion && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{product.name}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {user && (
                      <Switch 
                        checked={!!product.isPublic} 
                        onCheckedChange={(checked) => handleTogglePublic(product, checked)}
                        className="ml-2"
                        aria-label={
                          product.isPublic 
                            ? "Remover das sugestões públicas" 
                            : "Tornar uma sugestão pública"
                        }
                      />
                    )}
                  </>
                )}

                {isSuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSuggestion(product)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                )}
              </div>
            </div>
            {!isSuggestion && user && (
              <div className="mt-2 text-xs flex items-center">
                {product.isPublic ? (
                  <div className="flex items-center text-blue-600">
                    <Globe2 className="h-3 w-3 mr-1" /> 
                    <span>Disponível como sugestão para outros usuários</span>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" /> 
                    <span>Produto privado</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    } else {
      return (
        <tr key={product.id} className="border-b hover:bg-muted/50">
          <td className="px-4 py-2">{product.name}</td>
          <td className="px-4 py-2">{product.code || "-"}</td>
          <td className="px-4 py-2">{product.category}</td>
          <td className="px-4 py-2">{formatCurrency(product.price)}</td>
          <td className="px-4 py-2">
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
          </td>
          <td className="px-4 py-2 text-right">
            <div className="flex justify-end gap-2 items-center">
              {!isSuggestion && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmar exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o produto "{product.name}"?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {user && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {product.isPublic ? (
                          <Globe className="h-4 w-4 text-blue-500" aria-label="Produto público" />
                        ) : (
                          <Lock className="h-4 w-4" aria-label="Produto privado" />
                        )}
                      </span>
                      <Switch 
                        checked={!!product.isPublic} 
                        onCheckedChange={(checked) => handleTogglePublic(product, checked)}
                        aria-label={product.isPublic ? "Remover das sugestões" : "Adicionar às sugestões"}
                      />
                    </div>
                  )}
                </>
              )}

              {isSuggestion && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSuggestion(product)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              )}
            </div>
          </td>
        </tr>
      );
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
            
            <div className="flex gap-2">
              {user && (
                <Button
                  variant="outline"
                  onClick={handleSyncProducts}
                  disabled={isSyncingProducts}
                >
                  <CloudCog className={`mr-2 h-4 w-4 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  {isSyncingProducts ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              )}
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
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
                  <ProductForm onSubmit={handleAddProduct} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos disponíveis no sistema.
              </CardDescription>
              
              {user && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList>
                    <TabsTrigger value="products">Meus Produtos</TabsTrigger>
                    <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou categoria..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <div className="overflow-auto">
                  <div className="min-w-full inline-block align-middle">
                    {activeTab === "products" ? (
                      isMobile ? (
                        <div className="grid gap-4">
                          {filteredProducts.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                              {products.length === 0
                                ? "Nenhum produto cadastrado. Clique em 'Adicionar Produto' para começar."
                                : "Nenhum produto encontrado com os critérios de busca."}
                            </div>
                          ) : (
                            filteredProducts.map((product) => renderProductItem(product))
                          )}
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Nome</th>
                              <th className="px-4 py-2 text-left">Código</th>
                              <th className="px-4 py-2 text-left">Categoria</th>
                              <th className="px-4 py-2 text-left">Preço</th>
                              <th className="px-4 py-2 text-left">Estoque</th>
                              <th className="px-4 py-2 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                  {products.length === 0
                                    ? "Nenhum produto cadastrado. Clique em 'Adicionar Produto' para começar."
                                    : "Nenhum produto encontrado com os critérios de busca."}
                                </td>
                              </tr>
                            ) : (
                              filteredProducts.map((product) => renderProductItem(product))
                            )}
                          </tbody>
                        </table>
                      )
                    ) : (
                      isMobile ? (
                        <div className="grid gap-4">
                          {filteredSuggestions.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                              Nenhuma sugestão de produto disponível no momento.
                            </div>
                          ) : (
                            filteredSuggestions.map((product) => renderProductItem(product, true))
                          )}
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Nome</th>
                              <th className="px-4 py-2 text-left">Código</th>
                              <th className="px-4 py-2 text-left">Categoria</th>
                              <th className="px-4 py-2 text-left">Preço</th>
                              <th className="px-4 py-2 text-left">Estoque</th>
                              <th className="px-4 py-2 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSuggestions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                  Nenhuma sugestão de produto disponível no momento.
                                </td>
                              </tr>
                            ) : (
                              filteredSuggestions.map((product) => renderProductItem(product, true))
                            )}
                          </tbody>
                        </table>
                      )
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

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
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;
