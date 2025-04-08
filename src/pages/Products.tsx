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
import { formatCurrency } from "@/lib/utils";
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, logCurrentUser } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Fetch products from Supabase
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log("Fetching products...");
      // Log the current user for debugging
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
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products fetched:", data);
      return data as Product[];
    },
    enabled: !!user, // Only run the query when user is available
  });

  useEffect(() => {
    if (data) {
      setProducts(data);
    }
  }, [data]);

  // Filtrar produtos baseado na busca
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      refetch();
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
      refetch();
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
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao excluir produto: ${error.message}`);
      console.error("Erro ao excluir produto:", error);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando produtos...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar produtos: {(error as Error).message}</p>
            <Button onClick={() => refetch()} className="mt-2">Tentar novamente</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
            
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
                <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos disponíveis no sistema.
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
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <div className="overflow-auto">
                  <div className="min-w-full inline-block align-middle">
                    {isMobile ? (
                      // Versão mobile: Cards em vez de tabela
                      <div className="grid gap-4">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            {products.length === 0
                              ? "Nenhum produto cadastrado. Clique em 'Adicionar Produto' para começar."
                              : "Nenhum produto encontrado com os critérios de busca."}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
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
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    ) : (
                      // Versão desktop: Tabela
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
                            filteredProducts.map((product) => (
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
                                  <div className="flex justify-end gap-2">
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
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
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
